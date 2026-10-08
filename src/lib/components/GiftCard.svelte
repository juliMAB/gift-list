<script lang="ts">
	interface Props {
		id: string;
		title: string;
		description: string;
		link: string;
		price: string;
		image_url: string;
		status: 'available' | 'reserved' | 'purchased';
	}

	let { title, description, link, price, image_url, status } = $props();

	function badgeStyle(s) {
		const map = {
			available: { bg: '#ecfdf5', text: '#047857', border: '#10b981' },
			reserved: { bg: '#fffbeb', text: '#b45309', border: '#eab308' },
			purchased: { bg: '#f8fafc', text: '#475569', border: '#64748b' }
		};
		const c = map[s];
		return `background-color:${c.bg};color:${c.text};border-color:${c.border}`;
	}

	function label(s) {
		return s === 'available' ? 'Disponible' : s === 'reserved' ? 'Reservado' : 'Comprado';
	}
</script>

<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
	<div class="flex items-start gap-3">
		{#if image_url}
			<img src={image_url} alt="" class="h-16 w-16 rounded-md object-cover" />
		{/if}
		<div class="flex-1">
			<h3 class="font-medium">{title}</h3>
			{#if description}
				<p class="mt-1 text-sm text-slate-600">{description}</p>
			{/if}
			<div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
				{#if link}
					<a href={link} target="_blank" class="underline hover:text-indigo-600">Link</a>
				{/if}
				{#if price}
					<span>· {price}</span>
				{/if}
			</div>
		</div>
		<span class="shrink-0 rounded-full px-2 py-1 text-xs font-medium border border-current" style={badgeStyle(status)}>
			{label(status)}
		</span>
	</div>
</div>
