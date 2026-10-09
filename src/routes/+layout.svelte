<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';

	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch (e) {}
	}
</script>

<main class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
	<div class="mx-auto max-w-xl px-4 py-6">
		<div class="flex justify-end">
			<button
				type="button"
				onclick={toggle}
				title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
				class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
			>
				{dark ? 'Claro' : 'Oscuro'}
			</button>
		</div>

		<header class="mb-6 text-center">
			<h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Mi lista de regalos 🎁</h1>
			<p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Hola! ya se acerca mi cumpleaños. Si querés saber qué me gustaría regalarme, mirá la lista de abajo o agregá algo de tu elección.</p>
		</header>

		<slot />
	</div>
</main>
