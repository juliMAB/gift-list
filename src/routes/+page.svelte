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
	let readMode = $state(false);
	let readUrl = $state('');
	let readText = $state('');
	const READ_PLACEHOLDER = 'Ej: { title: "...", price: "...", description: "..." }';

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
		navigator.clipboard.writeText(location.origin);
	}

	function startReading() {
		readMode = true;
		readUrl = link;
		readText = '';
	}

	function submitRead() {
		readMode = false;
	}

	function autocompletar() {
		try {
			const obj = JSON.parse(readText);
			if (obj.title) title = obj.title;
			if (obj.description) description = obj.description;
			if (obj.price) price = obj.price;
			error = null;
		} catch {
			error = 'No se entendió el formato. Pegá un JSON con title / description / price (o completalo manualmente).';
		}
	}

	$effect(() => { load(); });
</script>

<!-- Banner para el dueño -->
<div class="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm">
	<p class="font-medium">Soy el dueño de la lista. Para agregá regalos:</p>
	<ol class="mt-2 list-decimal space-y-1 pl-5">
		<li>Pegá el link de lo que quieras y completá los datos de abajo.</li>
		<li>Querés que la IA lea el link? Usá el botón <strong>"Leer link con IA"</strong>: le das al link y pegás lo que Chopy te devuelva.</li>
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
		{#if !readMode}
			<button
				type="button"
				class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				onclick={startReading}
			>
				Leer link con IA
			</button>
		{/if}
	</div>

	{#if readMode}
		<div class="mb-3 rounded-md bg-slate-100 p-3">
			<p class="text-xs text-slate-500">Este link se lo enviaste a Chopy para que lo lea:</p>
			<p class="break-all font-mono text-sm">{readUrl}</p>
		</div>
		<div class="mb-3">
			<label class="block text-xs font-medium text-slate-700">Datos que te devolvió Chopy</label>
			<textarea
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
				rows="4"
				placeholder={READ_PLACEHOLDER}
				oninput={(e) => readText = (e.target as HTMLTextAreaElement).value}
			></textarea>
			<p class="mt-1 text-xs text-slate-500">Cuando Chopy te devuelva los datos, copiálos acá. Si vienen en formato JSON, usá el botón de autocompletar.</p>
		</div>
		<div class="mb-3 flex gap-2">
			<button
				type="button"
				class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				onclick={autocompletar}
			>
				Autocompletar desde JSON
			</button>
			<button
				type="button"
				class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				onclick={submitRead}
			>
				Continuar completando
			</button>
			<button
				type="button"
				class="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200"
				onclick={() => { readMode = false; link = ''; readText = ''; }}
			>
				Cancelar
			</button>
		</div>
	{:else}
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
	{/if}

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
