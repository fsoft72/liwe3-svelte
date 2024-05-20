<script context="module" lang="ts">
	export interface GridFieldExtra {
		dateFormat?: string;
	}

	export interface GridField {
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
		extra?: GridFieldExtra;

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
	import Modal from './Modal.svelte';
	import Avatar from './Avatar.svelte';
	import type { IconSource } from 'svelte-hero-icons';
	import type { Color, Variant } from '$liwe3/types/types';
	import { debounce, format_date, toBool } from '$liwe3/utils/utils';
	import { filterModes } from '$liwe3/utils/match_filter';
	import { onMount } from 'svelte';

	type UpdateFieldCallback = (row: GridDataRow, field_name: string, value: any) => void;

	interface Props {
		fields: GridField[];
		data: GridDataRow[];
		actions?: GridAction[];
		mode?: Color;

		// events
		onupdatefield?: UpdateFieldCallback | null;
		onfilterchange?: (filters: { [key: string]: any }) => void;

		// restProps
		[k: string]: any;
	}

	let {
		fields = [],
		data = [],
		actions = [],
		mode = 'mode3',

		// events
		onupdatefield,
		onfilterchange,

		// restProps
		...restProps
	}: Props = $props();

	let showFieldsModal = $state(false);
	let fieldsUI = $state(fields);

	let is_resizing = false;
	let td: HTMLTableCellElement | null = null;
	let is_editing = false;
	// here we save the current grid filters
	let filters: { [key: string]: any } = {};

	const minWidthArray: number[] = [];

	// the has_filters is true if at least one field is filterable
	let has_filters = fieldsUI.some((f) => f.filterable);

	/**
	 * Clone the header of the table and append it to the fixed header div
	 * must be called after the table is rendered to initialize fixed header
	 *
	 * @returns void
	 */
	const cloneHeader = () => {
		if (!table_element || !table_fixed) return;

		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		table.className = table_element.className;
		table.appendChild(tbody);
		table.style.width = `100%`;

		function moveFirstRow() {
			if (elem_tbody && elem_tbody.rows.length > 0) {
				const row = elem_tbody.rows[0];
				elem_tbody.removeChild(row);
				tbody.appendChild(row);
			}
		}

		let elem_tbody = table_element.querySelector('tbody');
		if (!elem_tbody) return;

		moveFirstRow();

		if (has_filters) moveFirstRow();

		// get cloned element height
		table_fixed.innerHTML = '';
		table_fixed.style.left = `0px`;
		table_fixed.style.width = `100%`;
		table_fixed.appendChild(table);

		setTableMinWidth();
		resizeHeaderCells();
	};

	/**
	 * Define header cells width and max-width based on first row of data table
	 * max-width is necessary to apply overflow-x on the header cells
	 * and data table cells min width based on filters row and compare with header cells' text
	 *
	 * @returns void
	 */
	const setTableMinWidth = () => {
		if (!table_fixed || !table_element) return;

		const table = table_fixed.querySelector('table');
		if (!table) return;
		// create a dummy dom element to calculate the computed width of the cell based on its innerHTML
		function _getComputedWidth(el: HTMLElement) {
			if (el.classList.contains('resize')) return 0;
			if (el.innerHTML === '' || el.innerHTML === '<!---->') return 0;

			const computedStyle = getComputedStyle(el);
			const dummy = document.createElement('div');
			dummy.style.visibility = 'hidden';
			dummy.style.position = 'absolute';
			dummy.style.top = '-9999px';
			dummy.style.fontFamily = computedStyle.fontFamily;
			dummy.style.fontSize = computedStyle.fontSize;
			dummy.style.fontWeight = computedStyle.fontWeight;
			dummy.style.fontStyle = computedStyle.fontStyle;
			dummy.style.letterSpacing = computedStyle.letterSpacing;
			dummy.style.textTransform = computedStyle.textTransform;
			dummy.style.padding = computedStyle.padding;
			dummy.innerHTML = el.innerHTML;
			document.body.appendChild(dummy);

			const minWidth = dummy.offsetWidth;
			document.body.removeChild(dummy);
			return minWidth; // + 5;
		}
		// iterate over the cells set appropriate width, min-width and max-width
		// If compare is true, we compare the width of the cell with the existing min-width
		function _loopCells(row: HTMLTableRowElement, compare: boolean) {
			if (!table_element || !table || table_element.rows.length < 1) return;

			let idx = 0;

			while (idx < row.cells.length) {
				const cell = row.cells[idx];
				const width = _getComputedWidth(cell);
				if (compare) {
					if (width > minWidthArray[idx]) {
						minWidthArray[idx] = width;
						table_element.rows[0].cells[idx].style.minWidth = width + 'px';
					}
				} else {
					minWidthArray.push(width);
					table.rows[0].cells[idx].style.maxWidth = width + 'px';
					table.rows[1].cells[idx].style.width = width + 'px';
				}
				//table_element.rows[0].cells[idx].style.minWidth = minWidthArray[idx] + 'px';
				idx++;
			}
		}

		// define header cells width and max-width  based on first row of data table
		_loopCells(table_element.rows[0], false);
		if (has_filters) _loopCells(table.rows[1], true);
	};

	/**
	 * Resize the fixed header cells based on the data table first row cells width
	 * It is called during the fixed header initialization and on window and cells resize
	 *
	 * @returns void
	 */
	const resizeHeaderCells = () => {
		if (!table_element || table_element.rows.length < 1 || !table_fixed) return;

		let idx = 0;
		const main_row = table_element.rows[0];
		const table = table_fixed.querySelector('table');

		if (!table) return;

		// get the width of original header cells
		while (idx < main_row.cells.length) {
			const width = main_row.cells[idx].getBoundingClientRect().width + 'px';
			table.rows[0].cells[idx].style.width = width;
			table.rows[0].cells[idx].style.maxWidth = width;
			if (has_filters) {
				table.rows[1].cells[idx].style.width = width;
				table.rows[1].cells[idx].style.maxWidth = width;
			}
			idx++;
		}
	};

	const resizeHeaderDebounced = debounce(resizeHeaderCells, 100);

	const _getTable = (el: HTMLElement | null): HTMLElement | null => {
		if (el && el.tagName === 'TABLE') return el;
		if (el && el.tagName !== 'BODY') return _getTable(el.parentElement);
		return null;
	};

	const _preventUserSelect = (el: HTMLElement) => {
		const table = _getTable(td);
		if (!table) return;

		(table as any)._userSelect = table.style.userSelect;
		table.style.userSelect = 'none';
	};

	const _revertUserSelect = (el: HTMLElement) => {
		const table = _getTable(td);
		if (!table) return;

		table.style.userSelect = (table as any)._userSelect;
	};

	const resize_start = (e: MouseEvent) => {
		// get the td element before this one
		td = (e.target as HTMLTableCellElement)?.previousElementSibling as HTMLTableCellElement;

		if (!td) return;

		_preventUserSelect(td);

		console.log('=== RESIZE START:', td);
		is_resizing = true;
	};

	const mouse_move = (e: MouseEvent) => {
		if (!is_resizing) return;
		if (!td) return;

		_revertUserSelect(td);

		const width = e.clientX - td.getBoundingClientRect().left;
		console.log('=== RESIZE MOVE:', width);
		td.style.width = `${width}px`;
		td.style.maxWidth = `${width}px`;
		resizeHeaderDebounced();
	};

	const mouse_up = () => {
		is_resizing = false;
		td = null;
		resizeHeaderDebounced();
	};

	const cell_doubleclick = (e: MouseEvent, row: GridDataRow, field_name: string) => {
		const field = fieldsUI.find((f) => f.name === field_name);
		if (!field) return;

		if (!field.editable) return;

		is_editing = true;

		// create an input element
		const input = document.createElement('input');
		input.type = 'text'; //field.type;
		input.classList.add('liwe3-form', 'liwe3-form-custom-input', mode, 'input', 'xs');
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
			onupdatefield && onupdatefield(row, field_name, row[field_name]);
		});

		// focus the input
		input.focus();
	};

	const filter_change = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const name = input.name.replace('f_', '');
		const field = fieldsUI.find((f) => f.name === name);
		let value: any = input.value;
		let mode = field?.searchMode || filterModes.contains;

		// console.log('=== FILTER CHANGE: ', { name, field, value, mode, type: input.type });

		if (name.endsWith('_1')) {
			mode = filterModes['>='];
		} else if (name.endsWith('_2')) {
			mode = filterModes['<='];
		}

		// we add to the query only checkboxes that are set to true
		if (input.type == 'checkbox' && toBool(value) == false) {
			const nf = { ...filters };
			delete nf[name];

			filters = nf;
			onfilterchange && onfilterchange(filters);
			resizeHeaderDebounced();
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

		onfilterchange && onfilterchange(filters);
		resizeHeaderDebounced();
	};

	let table_element: HTMLTableElement | null = null;
	let table_fixed: HTMLDivElement | null = null;

	onMount(() => {
		cloneHeader();
		window.addEventListener('resize', resizeHeaderDebounced);

		return () => {
			window.removeEventListener('resize', resizeHeaderDebounced);
		};
	});
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="table">
	<div class="wrapper">
		<div class="fixed-header" bind:this={table_fixed}></div>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore event_directive_deprecated -->
		<table
			class={`data-table ${mode}`}
			onmousemove={mouse_move}
			onmouseup={mouse_up}
			bind:this={table_element}
		>
			<tbody>
				<!-- headers -->
				<tr>
					{#each fieldsUI as field, idx}
						{#if !field.hidden}
							<th
								style={`width: ${field.width || 'auto'};`}
								class:buttons-aside={idx === fieldsUI.length - 1 && actions.length == 0}
							>
								{field.label || field.name}
								{#if actions.length === 0 && idx === fieldsUI.length - 1}
									<div class="buttons">
										<Button mode="mode4" size="xs" onclick={() => (showFieldsModal = true)}
											>Fields</Button
										>
									</div>
								{/if}
							</th>
							<th class="resize" onmousedown={resize_start}></th>
						{/if}
					{/each}
					{#if actions.length > 0}
						<th class="buttons-aside">
							<div class="label">Actions</div>
							<div class="buttons">
								<Button mode="mode4" size="xs" onclick={() => (showFieldsModal = true)}
									>Fields</Button
								>
							</div>
						</th>
					{/if}
				</tr>

				<!-- filters -->
				{#if has_filters}
					<tr>
						{#each fieldsUI as field}
							{#if !field.hidden}
								<td class="filter" style={`width: ${field.width || 'min-content'};`}>
									{#if field.filterable}
										{#if field.type == 'string'}
											<Input
												{mode}
												width={field.width}
												size="xs"
												name={`f_${field.name}`}
												onchange={filter_change}
											/>
										{:else if field.type == 'number'}
											<Input
												{mode}
												size="xs"
												type="number"
												name={`f_${field.name}_1`}
												onchange={filter_change}
											/>
											<Input
												{mode}
												size="xs"
												type="number"
												name={`f_${field.name}_2`}
												onchange={filter_change}
											/>
										{:else if field.type == 'date'}
											<Input
												{mode}
												size="xs"
												type="date"
												name={`f_${field.name}_1`}
												onchange={filter_change}
											/>
											<Input
												{mode}
												size="xs"
												type="date"
												name={`f_${field.name}_2`}
												onchange={filter_change}
											/>
										{:else if ['bool', 'boolean', 'checkbox'].indexOf(field.type) != -1}
											<Input
												{mode}
												name={`f_${field.name}`}
												size="xs"
												type="checkbox"
												onchange={filter_change}
											/>
										{/if}
									{/if}
								</td>
								<td class="resize" style="border: 0"></td>
							{/if}
						{/each}
						<td></td>
					</tr>
				{/if}

				<!-- rows -->
				{#each data as row}
					<tr>
						{#each fieldsUI as field}
							{#if !field.hidden}
								<td
									ondblclick={(e) => cell_doubleclick(e, row, field.name)}
									style={`text-align: ${field.align || 'left'}; width: ${
										field.width || 'auto'
									}; white-space: ${field.nowrap ? 'nowrap' : 'normal'};`}
								>
									{#if field.render}
										{#if field.click}
											<Button
												mode="mode4"
												size="sm"
												variant="outline"
												onclick={() => field.click && field.click(row)}
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
											onchange={(e: any) => {
												row[field.name] = e.target?.checked;
												onupdatefield && onupdatefield(row, field.name, row[field.name]);
											}}
										/>
									{:else if field.type == 'avatar'}
										<Avatar size="64px" value={row} />
									{:else if field.click}
										<Button
											mode="mode4"
											size="sm"
											variant="outline"
											onclick={() => field.click && field.click(row)}
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
									{:else}
										{row[field?.name || '']}
									{/if}
								</td>
								<td class="resize" onmousedown={resize_start}></td>
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
										onclick={() => action.action(row)}
									>
										{action.label ? action.label : ''}
									</Button>
								{/each}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if showFieldsModal}
	<Modal
		title="Fields"
		oncancel={() => (showFieldsModal = false)}
		closeOnEsc={true}
		closeOnOutsideClick={true}
	>
		<div class="fields-chk-container">
			{#each fieldsUI as field (field.name)}
				<div class="fields-chk">
					<Input
						type="checkbox"
						checked={field.hidden}
						label={field.name}
						onchange={(e: any) => (field.hidden = e.target.checked)}
					/>
				</div>
			{/each}
		</div>
	</Modal>
{/if}

<style>
	:root {
		--table-font-size: 0.8rem;
		--table-font-color: var(--liwe3-color);
		--table-font-family: var(--liwe3-main-font-family);
	}

	.fields-chk-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(24%, 1fr));
		gap: 0.5rem;
	}

	.fixed-header {
		position: sticky;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 1;
	}

	.wrapper,
	.table {
		position: relative;
		max-width: 100%;
		max-height: 100%;
	}

	.table {
		overflow: auto;
		/* make the scrollbars smaller */
		scrollbar-width: thin;
		/* make the scrollbars transparent */
		scrollbar-color: var(--liwe3-darker-paper) var(--liwe3-paper);
	}

	.data-table {
		width: 100%;

		border: 1px solid var(--liwe3-button-border);
		border-collapse: collapse;
		border-radius: var(--liwe3-border-radius);

		background-color: var(--liwe3-paper);
		color: var(--liwe3-color);

		font-size: var(--table-font-size);
		font-family: var(--table-font-family);
	}

	.data-table th {
		background-color: var(--liwe3-darker-paper);
		overflow-x: hidden;
	}

	.data-table tr {
		border-bottom: 1px solid var(--liwe3-tertiary-color);
		max-height: 2rem;
		transition: background-color 0.3s;
	}

	.data-table td {
		border-right: 1px solid var(--liwe3-tertiary-color);
	}

	.data-table tr:last-child td {
		border-bottom: none;
	}

	.data-table tr td:last-child {
		border-right: none;
	}

	.data-table th {
		text-align: left;
		/* disable selection */
		user-select: none;
	}

	.data-table td,
	.data-table th {
		padding: 0.5rem;
	}

	.buttons-aside {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.data-table tr:hover {
		background-color: var(--liwe3-tertiary-color);
	}

	.data-table td.actions {
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
	}

	/* table th borders can be dragged, make the pointer with the right cursor arrows */
	.data-table th.resize,
	.data-table td.resize {
		cursor: ew-resize;
		width: 2px;
		max-width: 2px;
		padding: 0;
		margin: 0;
		border-right: none;
	}
</style>
