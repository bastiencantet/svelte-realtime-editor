<script>
	import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<slot />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f5f5f5;
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>
