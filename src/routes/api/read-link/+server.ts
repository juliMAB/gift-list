import { json } from '@sveltejs/kit';

const UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const BLOCKED_HOST =
	/^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|::1$|fe80:|f[cd][0-9a-f]{2}:)/i;

function isSafeUrl(raw: string): URL | null {
	let u: URL;
	try {
		u = new URL(raw);
	} catch {
		return null;
	}
	if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
	if (BLOCKED_HOST.test(u.hostname)) return null;
	if (/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)) return null;
	return u;
}

function decode(s: string): string {
	if (!s) return '';
	return s
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&#x27;/gi, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&aacute;/g, 'á')
		.replace(/&eacute;/g, 'é')
		.replace(/&iacute;/g, 'í')
		.replace(/&oacute;/g, 'ó')
		.replace(/&uacute;/g, 'ú')
		.replace(/&ntilde;/g, 'ñ')
		.replace(/\s+/g, ' ')
		.trim();
}

function meta(html: string, prop: string): string {
	const a = new RegExp(
		`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`,
		'i'
	);
	const b = new RegExp(
		`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
		'i'
	);
	return decode((html.match(a) || html.match(b) || [])[1] || '');
}

function jsonLdBlocks(html: string): unknown[] {
	const out: unknown[] = [];
	const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html))) {
		try {
			out.push(JSON.parse(m[1].trim()));
		} catch {
			/* ignore malformed blocks */
		}
	}
	return out;
}

type LdNode = Record<string, unknown>;

function flatten(node: unknown, acc: LdNode[] = []): LdNode[] {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((n) => flatten(n, acc));
		return acc;
	}
	if (typeof node === 'object') {
		const o = node as LdNode;
		acc.push(o);
		if (o['@graph']) flatten(o['@graph'], acc);
	}
	return acc;
}

function str(v: unknown): string {
	if (v == null) return '';
	if (Array.isArray(v)) return v.length ? str(v[0]) : '';
	return String(v);
}

export type LinkData = {
	title: string;
	description: string;
	price: string;
	image_url: string;
	source: string;
};

async function fetchHtml(url: URL): Promise<string | null> {
	const ctrl = new AbortController();
	const to = setTimeout(() => ctrl.abort(), 12000);
	try {
		const res = await fetch(url, {
			headers: {
				'User-Agent': UA,
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
			},
			redirect: 'follow',
			signal: ctrl.signal
		});
		if (!res.ok) return null;
		const ct = res.headers.get('content-type') || '';
		if (!/html|xml|text/i.test(ct)) return null;
		return await res.text();
	} catch {
		return null;
	} finally {
		clearTimeout(to);
	}
}

function extract(html: string): LinkData {
	let title = meta(html, 'og:title') || meta(html, 'twitter:title');
	let description = meta(html, 'og:description') || meta(html, 'description');
	let image = meta(html, 'og:image') || meta(html, 'twitter:image');
	let price = '';
	let currency = '';

	if (!title) {
		title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
	}

	price =
		meta(html, 'product:price:amount') ||
		meta(html, 'og:price:amount') ||
		meta(html, 'twitter:data1');
	currency = meta(html, 'product:price:currency') || meta(html, 'og:price:currency');

	if (!price) {
		const m = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
		if (m) price = decode(m[1]);
	}

	for (const block of jsonLdBlocks(html)) {
		for (const n of flatten(block)) {
			const t = str(n['@type']).toLowerCase();
			if (!title && n.name && (t.includes('product') || t.includes('itempage'))) {
				title = decode(str(n.name));
			}
			if (!description && n.description && t.includes('product')) {
				description = decode(str(n.description));
			}
			if (n.image && !image) image = str(n.image);
			if (n.offers) {
				const offers = Array.isArray(n.offers) ? n.offers[0] : n.offers;
				if (offers && typeof offers === 'object') {
					const o = offers as LdNode;
					if (!price && o.price) price = str(o.price);
					if (!currency && o.priceCurrency) currency = str(o.priceCurrency);
				}
			}
		}
	}

	return {
		title: title.slice(0, 200),
		description: description.slice(0, 600),
		price: price ? `${price}${currency ? ' ' + currency : ''}`.slice(0, 60) : '',
		image_url: image.slice(0, 500),
		source: 'direct'
	};
}

async function viaMicrolink(url: URL): Promise<LinkData | null> {
	const ctrl = new AbortController();
	const to = setTimeout(() => ctrl.abort(), 15000);
	try {
		const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url.href)}`, {
			headers: { 'User-Agent': UA },
			signal: ctrl.signal
		});
		if (!res.ok) return null;
		const j = (await res.json()) as { status?: string; data?: Record<string, unknown> };
		if (j.status !== 'success' || !j.data) return null;
		const d = j.data;
		const image = (d.image as { url?: string } | undefined)?.url || '';
		return {
			title: str(d.title).slice(0, 200),
			description: str(d.description).slice(0, 600),
			price: '',
			image_url: str(image).slice(0, 500),
			source: 'microlink'
		};
	} catch {
		return null;
	} finally {
		clearTimeout(to);
	}
}

export async function GET({ url }: { url: URL }) {
	const target = url.searchParams.get('url') || '';
	const safe = isSafeUrl(target);
	if (!safe) {
		return json({ error: 'URL inválida.' }, { status: 400 });
	}

	const html = await fetchHtml(safe);
	let data: LinkData | null = html ? extract(html) : null;

	// Si el sitio devolvió una cáscara vacía (bloqueo de bots), probamos el reader.
	if (!data || (!data.title && !data.price) || looksBlocked(data.title)) {
		const fallback = await viaMicrolink(safe);
		if (fallback && (fallback.title || fallback.image_url)) {
			data = {
				title: data?.title && !looksBlocked(data.title) ? data.title : fallback.title,
				description: data?.description || fallback.description,
				price: data?.price || fallback.price,
				image_url: data?.image_url || fallback.image_url,
				source: fallback.source
			};
		}
	}

	if (!data || (!data.title && !data.description && !data.price && !data.image_url)) {
		return json(
			{
				error:
					'No pude leer ese link (el sitio bloquea la lectura automática). Completá los datos a mano.'
			},
			{ status: 422 }
		);
	}

	// Si lo unico que obtuvimos es una pagina de error/bloqueo, no sirve: pedimos completar a mano.
	if (looksBlocked(data.title) && !data.price) {
		return json(
			{
				error:
					'Ese sitio bloquea la lectura automática. Completá el título, la foto y el precio a mano.'
			},
			{ status: 422 }
		);
	}

	return json(data);
}

function looksBlocked(title: string): boolean {
	const t = title.toLowerCase().trim();
	if (!t) return true;
	return (
		t === 'amazon.com' ||
		t === 'mercadolibre' ||
		t === 'mercado libre' ||
		t === 'page not found' ||
		t.includes('just a moment') ||
		t.includes('attention required')
	);
}
