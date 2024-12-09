<script module lang="ts" >
	type ButtonProps = {
		mode?: Color;
		variant?: Variant
		size?: Size;
	};

	export type PaginatorButtons = {
		first: ButtonProps;
		prev: ButtonProps;
		next: ButtonProps;
		last: ButtonProps;
	};
</script>
<script lang="ts">
	import Button from './Button.svelte';
	import type { Color, Size, Variant } from '$liwe3/types/types';

	interface PaginatorProps {
		mode?: Color;
		page?: number; // current page
		rows?: number; // rows per page
		total?: number; // total number of rows
		buttons?: PaginatorButtons; // buttons customization

		onpagechange?: (page: number, rows: number) => void;
	}

	let { mode = 'mode1', page = 1, rows = 10, total = 0, buttons, onpagechange }: PaginatorProps = $props();

	let pages = $derived(Math.ceil(total / rows));

	const setPage = (num: number) => {
		if (num < 1 || num > pages) return;

		page = num;
		onpagechange && onpagechange(page, rows);
	};

	if ( ! buttons ) {
		buttons = {
			first: { mode: 'info', size: 'sm' },
			prev: { mode: 'success', size: 'sm' },
			next: { mode: 'success', size: 'sm' },
			last: { mode: 'info', size: 'sm' }
		};
	}

	export const resetPage = () => {
		setPage(1);
	};
</script>

<div class="paginator">
	<Button {...buttons.first} disabled={page == 1} onclick={() => setPage(1)}>First</Button>
	<Button {...buttons.prev} disabled={page == 1} onclick={() => setPage(page - 1)}
		>Prev</Button
	>
	<div class="paginator-text">{page} of {pages}</div>
	<Button {...buttons.next} disabled={page == pages} onclick={() => setPage(page + 1)}
		>Next</Button
	>
	<Button {...buttons.last} disabled={page == pages} onclick={() => setPage(pages)}>Last</Button
	>
</div>

<style>
	.paginator {
		display: flex;
		gap: 1em;
		justify-content: center;
		align-items: center;
		padding: 0.5rem 0;
	}
	.paginator-text {
		display: var(--liwe3-paginator-text-display, inline);
		font-size: var(--liwe3-paginator-text-size, 1rem);
		font-weight: var(--liwe3-paginator-text-weight, 500);
		color: var(--liwe3-paginator-text-color, var(--liwe3-color));
	}
</style>
