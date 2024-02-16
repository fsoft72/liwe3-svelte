<script context="module" lang="ts">
	export interface GridField {
		name: string;
		type: string;
		label?: string;
		sortable?: boolean;
		filterable?: boolean;
		searchMode?: string;
		editable?: boolean;
		deletable?: boolean;
		hidden?: boolean;
		align?: string;
		render?: (value: any, row: any) => any;
		click?: (row: any) => void;
	}

	export interface GridDataRow {
		id: string;
		[key: string]: any;
	}

	export interface GridAction {
		id: string;
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;
		action: (row: GridDataRow) => void;
	}
</script>

<script lang="ts">
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import { createEventDispatcher } from 'svelte';
	import Modal from './Modal.svelte';
	import Avatar from './Avatar.svelte';
	import type { IconSource } from 'svelte-hero-icons';
	import type { Color, Variant } from '$liwe3/types/types';
	import { toBool } from '$liwe3/utils/utils';

	const dispatch = createEventDispatcher();

	type UpdateFieldCallback = (row: GridDataRow, field_name: string, value: any) => void;

	export let fields: GridField[] = [];
	export let data: GridDataRow[] = [];
	export let actions: GridAction[] = [];
	export let updateField: UpdateFieldCallback | null = null;
	export let mode: Color = 'mode1';

	let is_resizing = false;
	let td: HTMLTableCellElement | null = null;
	let is_editing = false;
	// here we save the current grid filters
	let filters: { [key: string]: any } = {};

	// the has_filters is true if at least one field is filterable
	let has_filters = fields.some((f) => f.filterable);

	let showFieldsModal = false;

	const resize_start = (e: MouseEvent) => {
		// get the td element before this one
		td = (e.target as HTMLTableCellElement)?.previousElementSibling as HTMLTableCellElement;

		if (!td) return;

		is_resizing = true;
	};

	const mouse_move = (e: MouseEvent) => {
		if (!is_resizing) return;
		if (!td) return;

		const width = e.clientX - td.getBoundingClientRect().left;

		td.style.width = `${width}px`;
		td.style.maxWidth = `${width}px`;
	};

	const mouse_up = () => {
		is_resizing = false;
		td = null;
	};

	const cell_doubleclick = (e: MouseEvent, row: GridDataRow, field_name: string) => {
		const field = fields.find((f) => f.name === field_name);
		if (!field) return;

		if (!field.editable) return;

		is_editing = true;

		// create an input element
		const input = document.createElement('input');
		input.value = row[field_name];

		// replace the td content with the input
		const td = e.target as HTMLTableCellElement;
		td.innerHTML = '';
		td.appendChild(input);

		// if the user presses the ESC key, we cancel the edit
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				is_editing = false;
				td.innerHTML = row[field_name];
			}
		});

		// add a blur event to the input
		input.addEventListener('blur', () => {
			if (!is_editing) return;
			var do_update = true;

			// if the two values are the same, we don't need to update
			if (row[field_name] === input.value) do_update = false;

			// update the row
			row[field_name] = input.value;

			// remove the input
			td.innerHTML = row[field_name];

			if (!do_update) return;

			// update the field
			updateField && updateField(row, field_name, row[field_name]);
		});

		// focus the input
		input.focus();

		console.log('Edit', row, field_name);
	};

	const filter_change = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const name = input.name.replace('f_', '');
		const field = fields.find((f) => f.name === name);
		let value: any = input.value;
		let mode = field?.searchMode || '==';

		console.log('=== FILTER CHANGE: ', { name, field, value, mode, type: input.type });

		if (name.endsWith('_1')) {
			mode = '>=';
		} else if (name.endsWith('_2')) {
			mode = '<=';
		}

		// we add to the query only checkboxes that are set to true
		if (input.type == 'checkbox' && toBool(value) == false) {
			const nf = { ...filters };
			delete nf[name];

			filters = nf;
			dispatch('filterchange', filters);
			return;
		} else if (input.type == 'checkbox' && toBool(value) == true) {
			value = true;
		}

		const new_filters = {
			...filters,
			[name]: {
				mode,
				value
			}
		};

		// remove from new_filters the filters that have an empty value
		for (const key in new_filters) {
			const filter = new_filters[key];
			if (!filter.value) delete new_filters[key];
		}

		filters = new_filters;

		console.log('=== FILTER CHANGE: ', filters);

		dispatch('filterchange', filters);
	};

	/*
	$: {
		dispatch('filterchange', filters);
	}
	*/

	let table_element: HTMLTableElement | null = null;
	/*
	let table_height = 0;

	$: {
		if (table_element && !table_height) {
			// get the table height
			table_height = table_element.offsetHeight;

			// set the table height
			table_element.style.height = `${table_height}px`;
		}
	}
	*/
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="table">
	<table class={mode} on:mousemove={mouse_move} on:mouseup={mouse_up} bind:this={table_element}>
		<tbody>
			<!-- headers -->
			<tr>
				{#each fields as field}
					{#if !field.hidden}
						<th>{field.label || field.name}</th>
						<th class="resize" on:mousedown={resize_start} />
					{/if}
				{/each}
				{#if actions.length > 0}
					<th>Actions</th>
				{:else}
					<th />
				{/if}
				<th>
					<Button {mode} size="xs" on:click={() => (showFieldsModal = true)}>Fields</Button>
				</th>
			</tr>

			<!-- filters -->
			{#if has_filters}
				<tr>
					{#each fields as field}
						{#if !field.hidden}
							<td class="filter">
								{#if field.filterable}
									{#if field.type == 'string'}
										<Input {mode} size="xs" name={`f_${field.name}`} on:change={filter_change} />
									{:else if field.type == 'number'}
										<Input
											{mode}
											size="xs"
											type="number"
											name={`f_${field.name}_1`}
											on:change={filter_change}
										/>
										<Input
											{mode}
											size="xs"
											type="number"
											name={`f_${field.name}_2`}
											on:change={filter_change}
										/>
									{:else if field.type == 'date'}
										<Input
											{mode}
											size="xs"
											type="date"
											name={`f_${field.name}_1`}
											on:change={filter_change}
										/>
										<Input
											{mode}
											size="xs"
											type="date"
											name={`f_${field.name}_2`}
											on:change={filter_change}
										/>
									{:else if ['bool', 'boolean', 'checkbox'].indexOf(field.type) != -1}
										<Input
											{mode}
											name={`f_${field.name}`}
											size="xs"
											type="checkbox"
											on:change={filter_change}
										/>
									{/if}
								{/if}
							</td>
							<td style="border: 0" />
						{/if}
					{/each}
					<td />
					<td />
				</tr>
			{/if}

			<!-- rows -->
			{#each data as row}
				<tr>
					{#each fields as field}
						{#if !field.hidden}
							<td
								on:dblclick={(e) => cell_doubleclick(e, row, field.name)}
								style={`text-align: ${field.align}`}
							>
								{#if field.render}
									{#if field.click}
										<Button
											{mode}
											size="sm"
											variant="outline"
											on:click={() => field.click && field.click(row)}
										>
											{@html field.render(row[field.name], row)}
										</Button>
									{:else}
										{@html field.render(row[field.name], row)}
									{/if}
								{:else if ['bool', 'boolean', 'checkbox'].indexOf(field.type) != -1}
									<Input
										{mode}
										type="checkbox"
										checked={toBool(row[field.name])}
										on:change={(e) => {
											row[field.name] = e.target?.checked;
											updateField && updateField(row, field.name, row[field.name]);
										}}
									/>
								{:else if field.type == 'avatar'}
									<Avatar size="64px" value={row} />
								{:else if field.click}
									<Button
										{mode}
										size="sm"
										variant="outline"
										on:click={() => field.click && field.click(row)}
									>
										{row[field.name]}
									</Button>
								{:else}
									{row[field?.name || '']}
								{/if}
							</td>
							<td class="resize" on:mousedown={resize_start} />
						{/if}
					{/each}
					{#if actions.length > 0}
						<td class="actions">
							{#each actions as action}
								<Button
									size="xs"
									mode={action.mode || mode}
									variant={action.variant}
									icon={action.icon}
									on:click={() => action.action(row)}
								>
									{action.label ? action.label : ''}
								</Button>
							{/each}
						</td>
					{/if}
					<td />
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showFieldsModal}
	<Modal
		title="Fields"
		on:cancel={() => (showFieldsModal = false)}
		closeOnEsc={true}
		closeOnOutsideClick={true}
	>
		{#each fields as field (field.name)}
			<div class="fields-chk">
				<input type="checkbox" bind:checked={field.hidden} />
				{field.name}
			</div>
		{/each}
	</Modal>
{/if}

<style>
	:root {
		--table-font-size: 0.8rem;
		--table-font-color: var(--text-color);
		--table-font-family: var(--liwe-main-font-family);
	}

	.fields-chk {
		display: flex;
		align-items: center;
		align-content: center;
		gap: 0.5rem;
	}

	.table {
		min-width: 100%;
		overflow: auto;
		padding-bottom: 1rem;

		/* make the scrollbars smaller */
		scrollbar-width: thin;

		/* make the scrollbars transparent */
		/* scrollbar-color: var(--border) var(--paper); */
		scrollbar-color: var(--liwe3-dark-900) var(--liwe3-dark-400);
	}

	table {
		width: 100%;

		border: 1px solid var(--border);
		border-collapse: collapse;
		border-radius: var(--liwe-border-radius);

		background-color: var(--paper);

		font-size: var(--table-font-size);
		font-family: var(--table-font-family);
		color: var(--color);
	}

	table tr {
		border-bottom: 1px solid var(--darker);
		max-height: 2rem;
	}

	table td {
		border-right: 1px solid var(--darker);
	}

	table td .filter {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;

		padding: 0;
		border-right: none;
	}

	table tr:last-child td {
		border-bottom: none;
	}

	table tr td:last-child {
		border-right: none;
	}

	table th {
		text-align: left;
		background-color: var(--lighter);
		/* disable selection */
		user-select: none;
	}

	table td,
	table th {
		padding: 0.5rem;
	}

	table tr:hover td {
		background-color: var(--darker);
	}

	table td.actions {
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
	}

	/* table th borders can be dragged, make the pointer with the right cursor arrows */
	table th.resize,
	table td.resize {
		cursor: ew-resize;
		width: 2px;
		max-width: 2px;
		padding: 0;
		margin: 0;
		border-right: none;
	}
</style>
