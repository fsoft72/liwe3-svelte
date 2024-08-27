<script module lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import type { Color, Variant } from '$liwe3/types/types';
	import type { filterModes } from '$liwe3/utils/match_filter';

	import type { IconSource } from 'svelte-hero-icons';

	export interface DataGridFieldExtra {
		options?: { label: string; value: string }[];
		dateFormat?: string;
	}

	export interface DataGridField {
		name: string;
		type: string;
		label?: string;
		sortable?: boolean;
		filterable?: boolean;
		searchMode?: filterModes;
		editable?: boolean;
		deletable?: boolean;
		hidden?: boolean;
		align?: string;
		width?: string;
		nowrap?: boolean;
		pre?: string;
		extra?: DataGridFieldExtra;

		render?: (value: any, row: any) => any;

		onclick?: (row: any) => void;
	}

	export interface DataGridRow {
		id: string;
		[key: string]: any;
	}

	export interface DataGridAction {
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;

		onclick: (row: DataGridRow) => void;
	}

	export interface DataGridButton {
		id: string;
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;
		action: () => void;
	}
</script>

<script lang="ts">
	interface Props {
		fields: DataGridField[];
		data: DataGridRow[];
		actions?: DataGridAction[];

		viewMode?: string;

		// events
		oncelledit?: (row: DataGridRow, field: string, oldValue: any, newValue: any) => void;
	}

	let { fields, data, actions, viewMode = 'comfy', oncelledit }: Props = $props();

	let sortField: string | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');
	let tableElement: HTMLTableElement | null = $state(null);
	let editingCell: { rowIndex: number; field: string } | null = $state(null);

	function sortData(field: string): void {
		const fieldDef = fields.find((f) => f.name === field);
		if (!fieldDef || !fieldDef.sortable) return; // Only sort if field is sortable

		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}

		data = data.sort((a, b) => {
			if (a[field] < b[field]) return sortDirection === 'asc' ? -1 : 1;
			if (a[field] > b[field]) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function startResize(e: MouseEvent, field: string): void {
		e.preventDefault();
		const startX = e.clientX;
		const th = (e.target as HTMLElement).closest('th') as HTMLTableCellElement;
		const startWidth = th.offsetWidth;

		function onMouseMove(e: MouseEvent): void {
			const width = startWidth + e.clientX - startX;
			th.style.width = `${width}px`;
		}

		function onMouseUp(): void {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function startEditing(rowIndex: number, field: string): void {
		if (fields.find((f) => f.name === field)?.editable) {
			editingCell = { rowIndex, field };
		}
	}

	function finishEditing(row: DataGridRow, field: string, event: Event): void {
		const input = event.target as HTMLInputElement;
		const newValue = input.value;
		const oldValue = row[field];

		if (newValue !== oldValue.toString()) {
			const updatedRow = { ...row, [field]: newValue };
			data[editingCell!.rowIndex] = updatedRow;
			data = [...data]; // Trigger Svelte reactivity
			oncelledit?.(updatedRow, field, oldValue, newValue);
		}

		editingCell = null;
	}

	function handleKeyDown(event: KeyboardEvent, row: DataGridRow, field: string): void {
		if (event.key === 'Enter') {
			finishEditing(row, field, event);
		} else if (event.key === 'Escape') {
			editingCell = null;
		}
	}
</script>

<div class="dataview">
	<table bind:this={tableElement} class={viewMode}>
		<thead>
			<tr>
				{#each fields as field}
					<th onclick={() => sortData(field.name)}>
						{field.name}
						{#if field.sortable && sortField === field.name}
							{sortDirection === 'asc' ? '▲' : '▼'}
						{/if}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="resizer" onmousedown={(e) => startResize(e, field.name)}></div>
					</th>
				{/each}
				{#if actions}
					<th class="actions-header">Actions</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each data as row, rowIndex}
				<tr>
					{#each fields as field}
						<td ondblclick={() => startEditing(rowIndex, field.name)}>
							{#if editingCell && editingCell.rowIndex === rowIndex && editingCell.field === field.name}
								<input
									type="text"
									value={row[field.name]}
									onblur={(e) => finishEditing(row, field.name, e)}
									onkeydown={(e) => handleKeyDown(e, row, field.name)}
								/>
							{:else}
								{row[field.name]}
							{/if}
						</td>
					{/each}
					{#if actions}
						<td class="actions-cell">
							{#each actions as action}
								<Button size="xs" onclick={() => action.onclick(row)}>{action.label}</Button>
							{/each}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	:root {
		--table-font-size: 0.8rem;
		--table-font-color: var(--liwe3-color);
		--table-font-family: var(--liwe3-main-font-family);
	}

	.dataview {
		position: relative;

		width: 100%;
		height: 400px; /* Set a fixed height or use a responsive value */

		overflow: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--liwe3-darker-paper) var(--liwe3-paper);

		border: 1px solid var(--liwe3-button-border);
		border-radius: var(--liwe3-border-radius);
		background-color: var(--liwe3-paper);
		color: var(--liwe3-color);

		font-size: var(--table-font-size);
		font-family: var(--table-font-family);
	}

	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;

		border-radius: var(--liwe3-border-radius);
		border-collapse: collapse;
	}

	thead {
		position: sticky;
		top: -1px;
		z-index: 1;
		background-color: var(--liwe3-darker-paper);

		border-bottom: 1px solid var(--liwe3-button-border);
	}

	th,
	td {
		text-align: left;
		background-color: var(--liwe3-darker-paper);
		border: 1px solid var(--liwe3-secondary-color);
	}

	th {
		padding: 8px;
	}

	.condensed td {
		padding: 3px;
	}

	.comfy td {
		padding: 8px;
	}

	.large td {
		padding: 24px;
	}

	th {
		cursor: pointer;
		position: relative;
		background-color: var(--liwe3-secondary-color);

		user-select: none;
	}

	tr {
		border-bottom: 1px solid var(--liwe3-tertiary-color);
		max-height: 2rem;
	}

	td {
		border-right: 1px solid var(--liwe3-button-border);
	}

	tbody tr:nth-child(even) {
		background-color: var(--liwe3-darker-primary-color);
	}

	.dataview tr:hover {
		background-color: red !important;
	}

	td:hover {
		background-color: yellow;
	}

	.resizer {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 5px;
		background: rgba(0, 0, 0, 0.3);
		cursor: col-resize;
	}

	.actions-header,
	.actions-cell {
		width: 1%;
		white-space: nowrap;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 4px;
	}
</style>
