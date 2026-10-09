<script lang="ts">
	import { supabase } from '$lib/db/supabase';

	interface Props {
		id: string;
		title: string;
		description: string;
		link: string;
		price: string;
		image_url: string;
		status: 'available' | 'reserved' | 'purchased';
		reserved_by?: string;
		onchange?: () => void;
	}

	let { id, title, description, link, price, image_url, status, reserved_by, onchange }: Props =
		$props();

	let open = $state(false);
	let name = $state('');
	let busy = $state(false);
	let err = $state<string | null>(null);

	function badgeStyle(s) {
		const map = {
			available: { bg: '#ecfdf5', text: '#047857', border: '#10b981' },
			reserved: { bg: '#fffbeb', text: '#b45309', border: '#eab308' },
			purchased: { bg: '#f8fafc', text: '#475569', border: '#64748b' }
		};
		const c = map[s] ?? map.available;
		return `background-color:${c.bg};color:${c.text};border-color:${c.border}`;
	}

	function label(s) {
		return s === 'available' ? 'Disponible' : s === 'purchased' ? 'Comprado' : 'Reservado';
	}

	async function confirmBuy() {
		const who = name.trim();
		if (!who) {
			err = 'Poné tu nombre.';
			return;
		}
		busy = true;
		err = null;
		const { error } = await supabase
			.from('gifts')
			.update({ status: 'purchased', reserved_by: who })
			.eq('id', id);
		busy = false;
		if (error) {
			err = error.message;
		} else {
			open = false;
			name = '';
			onchange?.();
		}
	}

	async function release() {
		busy = true;
		err = null;
		const { error } = await supabase
			.from('gifts')
			.update({ status: 'available', reserved_by: null })
			.eq('id', id);
		busy = false;
		if (error) {
			err = error.message;
		} else {
			onchange?.();
		}
	}
</script>

<div
	class="rounded-lg border bg-white p-4 shadow-sm"
	class:border-slate-200={status !== 'purchased'}
	class:border-slate-300={status === 'purchased'}
	class:bg-slate-50={status === 'purchased'}
>
	<div class="flex items-start gap-3">
		{#if image_url}
			<img src={image_url} alt="" class="h-16 w-16 rounded-md object-cover" />
		{/if}
		<div class="flex-1">
			<h3 class="font-medium" class:text-slate-500={status === 'purchased'}>{title}</h3>
			{#if description}
				<p class="mt-1 text-sm text-slate-600">{description}</p>
			{/if}
			<div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
				{#if link && status !== 'purchased'}
					<a href={link} target="_blank" class="underline hover:text-indigo-600">Link</a>
				{/if}
				{#if price}
					<span>· {price}</span>
				{/if}
			</div>

			{#if status === 'purchased'}
				<p class="mt-2 text-sm font-medium text-emerald-700">
					Lo compra {reserved_by || 'alguien'}
				</p>
				<button
					type="button"
					disabled={busy}
					class="mt-1 text-xs text-slate-400 underline hover:text-slate-600 disabled:opacity-50"
					onclick={release}
				>
					{busy ? 'Liberando...' : 'Me equivoqué, liberar'}
				</button>
			{:else}
				{#if !open}
					<button
						type="button"
						class="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
						onclick={() => { open = true; err = null; }}
					>
						Yo lo compro
					</button>
				{:else}
					<div class="mt-3 flex flex-wrap items-center gap-2">
						<input
							type="text"
							placeholder="Tu nombre"
							class="rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
							value={name}
							oninput={(e) => name = (e.target as HTMLInputElement).value}
							onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmBuy(); } }}
						/>
						<button
							type="button"
							disabled={busy}
							class="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
							onclick={confirmBuy}
						>
							{busy ? 'Guardando...' : 'Confirmar'}
						</button>
						<button
							type="button"
							disabled={busy}
							class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
							onclick={() => { open = false; err = null; }}
						>
							Cancelar
						</button>
					</div>
				{/if}
			{/if}

			{#if err}
				<p class="mt-2 text-xs text-red-700">{err}</p>
			{/if}
		</div>
		<span
			class="shrink-0 rounded-full border border-current px-2 py-1 text-xs font-medium"
			style={badgeStyle(status)}
		>
			{label(status)}
		</span>
	</div>
</div>
