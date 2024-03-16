<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	import Button from './Button.svelte';
	import type { Color } from '$liwe3/types/types';

	export let mode: Color = 'mode1';

	// current page
	export let page = 1;
	// rows per page
	export let rows = 10;
	// total number of rows
	export let total = 0;

	// pagination options
	export let options: number[] = [10, 20, 50, 100];

	export const setPage = (p: number) => {
		page = p;
	};

	$: pages = Math.ceil(total / rows);
	$: dispatch('pagechange', { page, rows });
</script>

<div class="paginator">
	<Button {mode} size="sm" disabled={page == 1} on:click={() => (page = 1)}>First</Button>
	<Button {mode} size="sm" disabled={page == 1} on:click={() => (page -= 1)}>Prev</Button>
	{page} of {pages}
	<Button {mode} size="sm" disabled={page == pages} on:click={() => (page += 1)}>Next</Button>
	<Button {mode} size="sm" disabled={page == pages} on:click={() => (page = pages)}>Last</Button>
</div>

<style>
	.paginator {
		display: flex;
		gap: 1em;
		justify-content: center;
		align-items: center;
		padding: 0.5rem 0;
	}
</style>
