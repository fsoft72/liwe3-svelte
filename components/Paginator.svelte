<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	import Button from './Button.svelte';

	// current page
	export let page = 1;
	// rows per page
	export let rows = 10;
	// total number of rows
	export let total = 0;

	// pagination options
	export let options: number[] = [10, 20, 50, 100];

	$: pages = Math.ceil(total / rows);
	$: dispatch('pagechange', { page, rows });
</script>

<div class="paginator">
	<Button size="sm" disabled={page == 1} on:click={() => (page = 1)}>First</Button>
	<Button size="sm" disabled={page == 1} on:click={() => (page -= 1)}>Prev</Button>
	{page} of {pages}
	<Button size="sm" disabled={page == pages} on:click={() => (page += 1)}>Next</Button>
	<Button size="sm" disabled={page == pages} on:click={() => (page = pages)}>Last</Button>
</div>

<style>
	.paginator {
		display: flex;
		gap: 1em;
		justify-content: center;
		align-items: center;
		margin: 1rem 0;
	}
</style>
