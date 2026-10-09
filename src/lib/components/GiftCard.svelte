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

	const cardClass = $derived(
		status === 'purchased'
			? 'rounded-lg border border-slate-300 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60'
			: 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900'
	);

	function badgeClass(s) {
		const map = {
			available:
				'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
			reserved:
				'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300',
			purchased:
				'border-slate-400 bg-slate-100 text-slate-600 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-300'
		};
		return map[s] ?? map.available;
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

<div class={cardClass}>
	<div class="flex items-start gap-3">
		{#if image_url}
			<img src={image_url} alt="" class="h-16 w-16 rounded-md object-cover" />
		{/if}
		<div class="flex-1">
			<h3 class="font-medium text-slate-900 dark:text-slate-100" class:text-slate-500={status === 'purchased'} class:dark:text-slate-500={status === 'purchased'}>{title}</h3>
			{#if description}
				<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
			{/if}
			<div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
				{#if link && status !== 'purchased'}
					<a href={link} target="_blank" class="underline hover:text-indigo-600 dark:hover:text-indigo-400">Link</a>
				{/if}
				{#if price}
					<span>· {price}</span>
				{/if}
			</div>

			{#if status === 'purchased'}
				<p class="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
					Lo compra {reserved_by || 'alguien'}
				</p>
				<button
					type="button"
					disabled={busy}
					class="mt-1 text-xs text-slate-400 underline hover:text-slate-600 disabled:opacity-50 dark:text-slate-500 dark:hover:text-slate-300"
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
							class="rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
							class="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
							onclick={() => { open = false; err = null; }}
						>
							Cancelar
						</button>
					</div>
				{/if}
			{/if}

			{#if err}
				<p class="mt-2 text-xs text-red-700 dark:text-red-400">{err}</p>
			{/if}
		</div>
		<span
			class="shrink-0 rounded-full border px-2 py-1 text-xs font-medium {badgeClass(status)}"
		>
			{label(status)}
		</span>
	</div>
</div>
