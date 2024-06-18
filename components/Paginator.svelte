<script lang="ts">
	import Button from './Button.svelte';
	import type { Color } from '$liwe3/types/types';

	interface PaginatorProps {
		mode?: Color;
		page?: number; // current page
		rows?: number; // rows per page
		total?: number; // total number of rows

		onpagechange?: (page: number, rows: number) => void;
	}

	let { mode = 'mode1', page = 1, rows = 10, total = 0, onpagechange }: PaginatorProps = $props();

	let pages = $derived(Math.ceil(total / rows));

	const setPage = (num: number) => {
		if (num < 1 || num > pages) return;

		page = num;
		onpagechange && onpagechange(page, rows);
	};
</script>

<div class="paginator">
	<Button {mode} size="sm" disabled={page == 1} onclick={() => setPage(1)}>First</Button>
	<Button {mode} size="sm" disabled={page == 1} onclick={() => setPage(page - 1)}>Prev</Button>
	{page} of {pages}
	<Button {mode} size="sm" disabled={page == pages} onclick={() => setPage(page + 1)}>Next</Button>
	<Button {mode} size="sm" disabled={page == pages} onclick={() => setPage(pages)}>Last</Button>
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
