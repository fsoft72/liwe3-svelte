<script module lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import type { Color, Variant } from '$liwe3/types/types';
	import type { filterModes } from '$liwe3/utils/match_filter';

	import type { IconSource } from 'svelte-hero-icons';
	import Checkbox from './Checkbox.svelte';
	import { format_date, toBool } from '$liwe3/utils/utils';
	import Avatar from './Avatar.svelte';

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
		id?: string;
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;

		onclick?: (row: DataGridRow) => void;
		action?: (row: DataGridRow) => void;
	}

	export interface DataGridButton {
		id?: string;
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;
		onclick: () => void;

		action?: () => void;
	}
</script>

<script lang="ts">
	interface Props {
		fields: DataGridField[];
		data: DataGridRow[];
		actions?: DataGridAction[];
		buttons?: DataGridButton[];

		title?: string; // DataGrid title
		mode?: Color;
		viewMode?: string;

		// events
		oncelledit?: (row: DataGridRow, field: string, oldValue: any, newValue: any) => void;

		onupdatefield?: (row: DataGridRow, field_name: string, value: any) => void;
	}

	let {
		fields,
		data: _data,
		actions,
		buttons,
		title,
		mode = 'mode3',
		viewMode = 'comfy',
		oncelledit,
		onupdatefield
	}: Props = $props();

	let sortField: string | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');
	let tableElement: HTMLTableElement | null = $state(null);
	let editingCell: { rowIndex: number; field: string } | null = $state(null);
	let data: DataGridRow[] = $state(_data);

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
			// data = [...data]; // Trigger Svelte reactivity

			if (onupdatefield) {
				console.warn('=== WARN: onupdatefield is deprecated. Use oncelledit instead.');
				onupdatefield(updatedRow, field, newValue);
				return;
			}

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

	const viewModes = ['condensed', 'comfy', 'large'];
	const changeViewMode = (mode: string) => {
		viewMode = mode;
	};
</script>

<div class="dataview">
	{#if title || buttons}
		<div class="title-bar">
			<div class="title">
				{title}
			</div>

			<div class="view-modes">
				{#each viewModes as vm}
					<Button
						mode={vm == viewMode ? 'mode4' : 'mode1'}
						onclick={() => changeViewMode(vm)}
						size="xs"
					>
						{vm}
					</Button>
				{/each}
			</div>

			{#if buttons}
				<div class="buttons">
					{#each buttons as button}
						<Button
							size="xs"
							mode={button.mode || mode}
							variant={button.variant}
							icon={button.icon}
							onclick={button.onclick}
						>
							{button.label}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
	<table bind:this={tableElement} class={viewMode}>
		<thead>
			<tr>
				{#each fields as field}
					{#if !field.hidden}
						<th onclick={() => sortData(field.name)}>
							{field.name}
							{#if field.sortable && sortField === field.name}
								{sortDirection === 'asc' ? '▲' : '▼'}
							{/if}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="resizer" onmousedown={(e) => startResize(e, field.name)}></div>
						</th>
					{/if}
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
						{#if !field.hidden}
							<td ondblclick={() => startEditing(rowIndex, field.name)}>
								{#if editingCell && editingCell.rowIndex === rowIndex && editingCell.field === field.name}
									<input
										type="text"
										value={row[field.name]}
										onblur={(e) => finishEditing(row, field.name, e)}
										onkeydown={(e) => handleKeyDown(e, row, field.name)}
									/>
								{:else if field.render}
									{#if field.onclick}
										<Button
											mode="mode4"
											size="sm"
											variant="outline"
											onclick={() => field.onclick && field.onclick(row)}
										>
											{@html field.render(row[field.name], row)}
										</Button>
									{:else}
										{@html field.render(row[field.name], row)}
									{/if}
								{:else if ['bool', 'boolean', 'checkbox'].includes(field.type)}
									<Checkbox
										{mode}
										checked={toBool(row[field.name])}
										onchange={(e: any) => {
											row[field.name] = e.target.checked;
											if (onupdatefield) {
												console.warn(
													'=== WARN: onupdatefield is deprecated. Use oncelledit instead.'
												);
												onupdatefield(row, field.name, e.target.checked);
												return;
											}
											oncelledit?.(row, field.name, !e.target.checked, e.target.checked);
										}}
									/>
								{:else if field.onclick}
									<Button
										mode="mode4"
										size="sm"
										variant="outline"
										onclick={() => field.onclick && field.onclick(row)}
									>
										{row[field.name]}
									</Button>
								{:else if field.type == 'date'}
									{#if field.extra?.dateFormat}
										{format_date(row[field.name], field.extra.dateFormat)}
									{:else}
										{row[field.name]}
									{/if}
								{:else if field.pre}
									<pre>{row[field.name]}</pre>
								{:else if field.type == 'avatar'}
									<Avatar size="64px" value={row} />
								{:else}
									{row[field.name]}
								{/if}
							</td>
						{/if}
					{/each}
					{#if actions}
						<td class="actions-cell">
							<div class="actions">
								{#each actions as action}
									<Button
										size="xs"
										mode={action.mode || mode}
										variant={action.variant}
										icon={action.icon}
										onclick={() => {
											if (action.action) {
												console.warn(
													"WARNING: use of deprecated 'action' property in DataGridAction. Use 'onclick' instead."
												);
												action.action(row);
												return;
											}
											action.onclick && action.onclick(row);
										}}>{action.label ?? ''}</Button
									>
								{/each}
							</div>
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

	.title-bar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 4px;

		background-color: var(--liwe3-darker-paper);
	}

	.title {
		font-weight: bold;
	}

	.buttons,
	.actions {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
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
		border: 1px solid var(--liwe3-secondary-color);
	}

	th {
		padding: 8px;
		background-color: var(--liwe3-darker-paper);
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

	tr:hover {
		background-color: var(--liwe3-lighter-paper) !important;
	}

	td {
		border-right: 1px solid var(--liwe3-button-border);
	}

	tbody tr:nth-child(even) {
		background-color: var(--liwe3-darker-paper);
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
