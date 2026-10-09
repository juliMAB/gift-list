<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/db/supabase';
	import GiftCard from '$lib/components/GiftCard.svelte';

	interface Gift {
		id: string;
		title: string;
		description: string;
		link: string;
		price: string;
		image_url: string;
		status: 'available' | 'reserved' | 'purchased';
		created_at: string;
	}

	let gifts = $state<Gift[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let reading = $state(false);
	let readError = $state<string | null>(null);
	let readOk = $state(false);
	let fromBrowser = $state(false);
	let copied = $state(false);
	let bmAnchor: HTMLAnchorElement | null = $state(null);

	// Formulario
	let title = $state('');
	let description = $state('');
	let link = $state('');
	let price = $state('');
	let imageUrl = $state('');

	async function load() {
		loading = true;
		const { data, error: e } = await supabase
			.from('gifts')
			.select('*')
			.order('created_at', { ascending: false });
		loading = false;
		if (e) {
			error = e.message;
		} else {
			gifts = data || [];
		}
	}

	async function submit() {
		creating = true;
		error = null;
		const { error: e } = await supabase.from('gifts').insert([
			{ title, description, link, price, image_url: imageUrl || null, status: 'available' }
		]);
		creating = false;
		if (e) {
			error = e.message;
		} else {
			title = ''; description = ''; link = ''; price = ''; imageUrl = '';
			await load();
		}
	}

	function copyLink() {
		navigator.clipboard.writeText(page.url.origin);
	}

	async function readLink() {
		if (!link) {
			error = 'Pegá primero el link del producto.';
			return;
		}
		reading = true;
		readError = null;
		readOk = false;
		error = null;
		try {
			const res = await fetch(`/api/read-link?url=${encodeURIComponent(link)}`);
			const data = await res.json();
			if (!res.ok) {
				readError = data.error || 'No pude leer ese link.';
			} else {
				if (data.title) title = data.title;
				if (data.description) description = data.description;
				if (data.price) price = data.price;
				if (data.image_url) imageUrl = data.image_url;
				readOk = true;
			}
		} catch {
			readError = 'No pude leer ese link.';
		} finally {
			reading = false;
		}
	}

	// Código del botón de navegador (bookmarklet). Corre en la página del producto,
	// con la sesión del usuario, y manda los datos ya leídos a esta app.
	const bookmarklet = $derived(
		'javascript:(function(){' +
			'var d=document,' +
			'g=function(s){return d.querySelector(s)},' +
			'meta=function(p){var e=g(\'meta[property="\'+p+\'"]\')||g(\'meta[name="\'+p+\'"]\');return e?(e.getAttribute("content")||""):""},' +
			'txt=function(s){var e=g(s);return e?e.textContent.trim():""},' +
			'title=meta("og:title")||(g("h1")?g("h1").textContent.trim():d.title),' +
			'img=meta("og:image")||((g("img")||{}).src||""),' +
			'price=meta("product:price:amount")||txt("[itemprop=price]")||txt(".andes-money-amount__fraction")||"",' +
			'cur=meta("product:price:currency")||"",' +
			'desc=meta("og:description")||meta("description")||"",' +
			'data={title:title,description:desc.slice(0,400),link:location.href,price:(price?(cur?cur+" "+price:price):""),image_url:img},' +
			'b64=btoa(unescape(encodeURIComponent(JSON.stringify(data))));' +
			'window.open("' + page.url.origin + '/#prefill="+encodeURIComponent(b64),"_blank");' +
		'})();'
	);

	function copyBookmarklet() {
		navigator.clipboard.writeText(bookmarklet);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// El anchor se arma por JS para que el navegador no sanitice el href "javascript:".
	$effect(() => {
		if (bmAnchor) bmAnchor.setAttribute('href', bookmarklet);
	});

	// Si venimos del botón de navegador, los datos vienen en el hash de la URL.
	$effect(() => {
		if (typeof window === 'undefined') return;
		const h = window.location.hash;
		if (!h.startsWith('#prefill=')) return;
		try {
			const json = decodeURIComponent(escape(atob(decodeURIComponent(h.slice(9)))));
			const d = JSON.parse(json);
			if (d.title) title = d.title;
			if (d.description) description = d.description;
			if (d.link) link = d.link;
			if (d.price) price = d.price;
			if (d.image_url) imageUrl = d.image_url;
			fromBrowser = true;
			history.replaceState(null, '', window.location.pathname);
		} catch {
			/* hash inválido: se ignora */
		}
	});

	$effect(() => { load(); });
</script>

<!-- Banner para el dueño -->
<div class="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm">
	<p class="font-medium">Soy el dueño de la lista. Para agregá regalos:</p>
	<ol class="mt-2 list-decimal space-y-1 pl-5">
		<li>Pegá el link de lo que quieras y tocá <strong>"Leer link"</strong>: se completan solos el título, la foto y el precio.</li>
		<li>Amazon y Mercado Libre bloquean esa lectura. Para esos, usá el <strong>botón de navegador</strong> de abajo.</li>
		<li>El link de esta página es el que le mandás a la familia: cualquiera puede ver la lista, solo vos agregás.</li>
	</ol>
</div>

<!-- Formulario -->
<form onsubmit={(e) => { e.preventDefault(); submit(); }} class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
	<h2 class="mb-3 text-lg font-semibold">Agregar regalo</h2>

	<div class="mb-3 flex gap-2">
		<input
			type="url"
			placeholder="https://..."
			class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
			value={link}
			oninput={(e) => link = (e.target as HTMLInputElement).value}
		/>
		<button
			type="button"
			disabled={reading}
			class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
			onclick={readLink}
		>
			{reading ? 'Leyendo...' : 'Leer link'}
		</button>
	</div>

	{#if fromBrowser}
		<p class="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
			Datos cargados desde el navegador. Revisalos y corregí lo que haga falta.
		</p>
	{:else if readOk}
		<p class="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
			Datos leídos del link. Revisalos y corregí lo que haga falta.
		</p>
	{/if}
	{#if readError}
		<p class="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
			{readError} Completá los datos a mano.
		</p>
	{/if}

	<div class="mb-3">
		<label class="block text-xs font-medium text-slate-700">Título</label>
			<input
				type="text"
				placeholder="Ej: Auriculares Sony WH-1000XM5"
				class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				value={title}
				oninput={(e) => title = (e.target as HTMLInputElement).value}
			/>
		</div>
		<div class="mb-3">
			<label class="block text-xs font-medium text-slate-700">Descripción</label>
			<textarea
				placeholder="Color, talla, modelo, enlaces a reseñas..."
				class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				rows="2"
				value={description}
				oninput={(e) => description = (e.target as HTMLTextAreaElement).value}
			></textarea>
		</div>
		<div class="mb-3">
			<label class="block text-xs font-medium text-slate-700">Precio (opcional)</label>
			<input
				type="text"
				placeholder="Ej: 350 USD"
				class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				value={price}
				oninput={(e) => price = (e.target as HTMLInputElement).value}
			/>
		</div>
		<div class="mb-3">
			<label class="block text-xs font-medium text-slate-700">Link de la foto (opcional)</label>
			<input
				type="url"
				placeholder="https://..."
				class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				value={imageUrl}
				oninput={(e) => imageUrl = (e.target as HTMLInputElement).value}
			/>
		</div>

	{#if error}
		<p class="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
	{/if}

	<button
		type="submit"
		disabled={creating}
		class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
	>
		{creating ? 'Agregando...' : 'Agregar a la lista'}
	</button>
</form>

<!-- Botón de navegador para tiendas que bloquean la lectura (Amazon, Mercado Libre) -->
<details class="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm">
	<summary class="cursor-pointer font-medium">
		¿Es de Amazon o Mercado Libre? Usá el botón de navegador
	</summary>
	<p class="mt-2 text-slate-600">
		Esas tiendas bloquean la lectura automática desde el servidor, pero no desde tu propio navegador.
		Instalá el botón una sola vez y después, en la página del producto, tocá el botón y se carga solo.
	</p>
	<ol class="mt-2 list-decimal space-y-1 pl-5 text-slate-600">
		<li>Arrastrá este enlace a la barra de marcadores (o copiá el código y creá un marcador nuevo con ese contenido):
			<span class="ml-1 inline-block">
				<a bind:this={bmAnchor} class="cursor-move rounded bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white no-underline" onclick={(e) => e.preventDefault()}>Leer regalo</a>
			</span>
		</li>
		<li>Abrí el producto en Amazon o Mercado Libre.</li>
		<li>Tocá el marcador <strong>"Leer regalo"</strong>: se abre esta página con los datos cargados.</li>
	</ol>
	<div class="mt-2 flex items-center gap-2">
		<button
			type="button"
			class="rounded bg-white px-2 py-1 text-xs ring-1 ring-slate-300 hover:bg-slate-50"
			onclick={copyBookmarklet}
		>
			{copied ? 'Copiado' : 'Copiar código'}
		</button>
		<span class="text-xs text-slate-500">Pegalo como dirección del marcador a mano.</span>
	</div>
</details>

<!-- Lista -->
<h2 class="mt-6 text-lg font-semibold">Mi lista de regalos ({gifts.length})</h2>

{#if loading}
	<p class="py-8 text-center text-sm text-slate-500">Cargando...</p>
{:else if error}
	<p class="py-8 text-center text-sm text-red-700">{error}</p>
{:else if gifts.length === 0}
	<p class="py-8 text-center text-sm text-slate-500">Aún no agregaste nada. Usá el formulario de arriba.</p>
{:else}
	<div class="mt-4 grid gap-4">
		{#each gifts as gift (gift.id)}
			<GiftCard {...gift} />
		{/each}
	</div>
{/if}

<!-- Banner final: link público -->
<div class="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm">
	<p class="font-medium text-indigo-900">Link público de la lista:</p>
	<div class="mt-1 flex items-center gap-2">
		<code class="flex-1 truncate rounded bg-white px-2 py-1 text-xs">{page.url.origin}</code>
		<button onclick={copyLink} class="rounded bg-white px-2 py-1 text-xs hover:bg-indigo-100">Copiar</button>
	</div>
	<p class="mt-1 text-xs text-indigo-700">Mandá ese link a tu familia. Ellos pueden ver todo, pero solo vos podés agregar regalos.</p>
</div>
