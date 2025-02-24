<script module lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import type { Color, Size, Variant } from '$liwe3/types/types';
	import { filterModes } from '$liwe3/utils/match_filter';

	import type { IconSource } from 'svelte-hero-icons';
	import Checkbox from './Checkbox.svelte';
	import { format_date, toBool } from '$liwe3/utils/utils';
	import Avatar from './Avatar.svelte';
	import Input from './Input.svelte';
	import Paginator from './Paginator.svelte';
	import type { PaginatorButtons } from './Paginator.svelte';
	import { onMount, tick } from 'svelte';

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
		options?: {
			filterSelect?: { value: string; label: string }[];
			select?: { value: string; label: string }[];
			validChars?: string;
			lower?: boolean;
			min?: number;
			max?: number;
		};

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
		hide?: boolean;

		onclick?: (row: DataGridRow) => void;
		action?: (row: DataGridRow) => void;
	}

	export interface DataGridButton {
		id?: string;
		label?: string;
		icon?: IconSource;
		mode?: Color;
		variant?: Variant;
		onclick: (checked?: boolean) => void;
		type?: 'button' | 'checkbox'; // New property
		checked?: boolean; // New property for checkbox state

		action?: () => void;
	}
</script>

<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		fields: DataGridField[];
		data: DataGridRow[];
		actions?: DataGridAction[];
		buttons?: DataGridButton[];

		filters?: Record<string, any>;

		title?: string; // DataGrid title
		mode?: Color;
		viewMode?: string;

		// paginator
		disablePaginator?: boolean;
		rowsPerPage?: number;
		page?: number;
		totalRows?: number;
		paginatorButtons?: PaginatorButtons;

		// events
		oncelledit?: (row: DataGridRow, field: string, oldValue: any, newValue: any) => void;

		onupdatefield?: (row: DataGridRow, field_name: string, value: any) => void;
		onfilterchange?: (filters: Record<string, any>) => void;
		onsortchange?: (field: string, direction: 'asc' | 'desc') => void;

		keyboardInputTimeout?: any;

		// paginator event
		onpagechange?: (page: number, rows: number) => void;
	}

	let {
		fields: _fields,
		data, // : _data,
		filters = $bindable({}),
		actions,
		buttons,
		title,
		mode = $bindable('mode3'),
		viewMode = $bindable('comfy'),

		// paginator
		disablePaginator,
		page = $bindable(1),
		totalRows,
		rowsPerPage = $bindable(10),
		paginatorButtons,

		// events
		oncelledit,
		onupdatefield,
		onfilterchange,
		onsortchange,
		keyboardInputTimeout,

		// paginator event
		onpagechange
	}: Props = $props();

	let sortField: string | null = $state(null);
	let sortDirection: 'asc' | 'desc' = $state('asc');
	let tableElement: HTMLTableElement | null = $state(null);
	let editingCell: { rowIndex: number; field: string } | null = $state(null);
	let fields = $state(_fields);
	let has_filters = fields.some((f) => f.filterable);
	let dataView: HTMLDivElement | null = $state(null);
	let paginator: any = $state(null);
	let buttonSize: Size = $state('md');
	let dontSendPaginationChange: boolean = $state(false);
	let kiTimeout: any = $state(null);

	let showFieldsModal = $state(false);

	$effect(() => {
		if (page) dataView?.scrollTo(0, 0);
	});

	let internalFilteredData: DataGridRow[] = $derived.by(() => {
		// if user defined onfilterchange, we don't filter the data
		if (onfilterchange) return data;
		if (!filters || Object.keys(filters).length == 0) return data;

		const res: DataGridRow[] = [];

		data.forEach((row) => {
			let add = true;

			for (const field in filters) {
				if (add == false) break;

				const filter = filters[field];

				// console.log('=== FILTER: ', { field, filter }) ;

				if (!row[field]) {
					add = false;
					break;
				}

				let v = row[field];

				switch (filter.mode) {
					case filterModes.CONTAINS:
						if (v.toLowerCase().indexOf(filter.value.toLowerCase()) == -1) add = false;
						break;

					case filterModes.LESS_THAN_OR_EQUAL:
						if (filter.type == 'date') {
							if (new Date(v) > new Date(filter.value)) add = false;
						} else if (filter.type == 'number') {
							if (parseFloat(v) > parseFloat(filter.value)) add = false;
						} else if (v > filter.value) add = false;

						break; // Ensure to add a break statement for case completeness
					// Add additional filter modes as necessary here
					case filterModes.GREATER_THAN_OR_EQUAL:
						if (filter.type == 'date') {
							if (new Date(v) < new Date(filter.value)) add = false;
						} else if (filter.type == 'number') {
							if (parseFloat(v) < parseFloat(filter.value)) add = false;
						} else if (v < filter.value) add = false;
						break;
					// Add other necessary filter modes
				}
			}

			if (add) res.push(row);
		});

		// reset page
		// paginator.resetPage();

		return res;
	});

	let paginatedData: DataGridRow[] = $derived.by(() => {
		if (disablePaginator) return internalFilteredData;

		return internalFilteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
	});

	let totRows = $derived.by(() => {
		if (totalRows) return totalRows;

		return internalFilteredData.length;
	});

	function sortData(field: string): void {
		const fieldDef = fields.find((f) => f.name === field);
		if (!fieldDef || !fieldDef.sortable) return; // Only sort if field is sortable

		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}

		onsortchange?.(field, sortDirection);

		// if field is numeric, sort as numbers
		if (fieldDef.type === 'number') {
			data = data.sort((a, b) => {
				const va = parseFloat(a[field]);
				const vb = parseFloat(b[field]);

				if (va < vb) return sortDirection === 'asc' ? -1 : 1;
				if (va > vb) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});
		} else {
			data = data.sort((a, b) => {
				if (a[field] < b[field]) return sortDirection === 'asc' ? -1 : 1;
				if (a[field] > b[field]) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});
		}
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

	async function startEditing(rowIndex: number, fieldName: string): Promise<void> {
		const fieldDef = fields.find((f) => f.name === fieldName);
		if (fieldDef?.editable) {
			editingCell = { rowIndex, field: fieldName };

			await tick();

			const element = document.querySelector(
				`[data-row="${rowIndex}"][data-field="${fieldName}"]`
			) as HTMLInputElement | HTMLSelectElement;

			if (element) {
				element.focus();
				if (element instanceof HTMLInputElement) {
					element.select();
				}
			}
		}
	}

	function handleTabKey(
		id_row: string,
		event: KeyboardEvent,
		rowIndex: number,
		fieldIndex: number
	): void {
		event.preventDefault();
		const currentField = fields[fieldIndex];
		finishEditing(id_row, currentField.name, event);

		const nextEditableField = findNextEditableField(rowIndex, fieldIndex);
		if (nextEditableField) {
			setTimeout(() => {
				startEditing(nextEditableField.rowIndex, fields[nextEditableField.fieldIndex].name);
			}, 50);
			// startEditing(nextEditableField.rowIndex, fields[nextEditableField.fieldIndex].name);
		}
	}

	function findNextEditableField(
		currentRowIndex: number,
		currentFieldIndex: number
	): { rowIndex: number; fieldIndex: number } | null {
		for (let rowIndex = currentRowIndex; rowIndex < data.length; rowIndex++) {
			for (
				let fieldIndex = rowIndex === currentRowIndex ? currentFieldIndex + 1 : 0;
				fieldIndex < fields.length;
				fieldIndex++
			) {
				if (fields[fieldIndex].editable && !fields[fieldIndex].hidden) {
					return { rowIndex, fieldIndex };
				}
			}
		}
		return null;
	}

	function finishEditing(id_row: string, field: string, event: Event): void {
		const row = data.find((r) => r.id === id_row);
		if (!row) return;

		const element = event.target as HTMLInputElement | HTMLSelectElement;
		let newValue = element.value;
		const oldValue = row[field];
		const fieldDef = fields.find((f) => f.name === field);

		if (fieldDef?.type === 'select') {
			if (!fieldDef?.options?.select?.length) {
				console.warn('=== WARN: select field must have options', fieldDef.name);
				return;
			}
		}

		if (fieldDef?.options?.validChars) {
			newValue = newValue
				.split('')
				.filter((char) => fieldDef.options!.validChars!.includes(char))
				.join('');
		}

		if (fieldDef?.options?.lower) newValue = newValue.toLowerCase();

		if (newValue !== oldValue?.toString()) {
			const updatedRow = { ...row, [field]: newValue };
			if (!editingCell) return;

			const rowIndex = editingCell.rowIndex + (page - 1) * rowsPerPage;

			data[rowIndex] = updatedRow;

			if (onupdatefield) {
				console.warn('=== WARN: onupdatefield is deprecated. Use oncelledit instead.');
				onupdatefield(updatedRow, field, newValue);
				return;
			}

			oncelledit?.(updatedRow, field, oldValue, newValue);
		}

		editingCell = null;
	}

	function handleKeyDown(
		event: KeyboardEvent,
		id_row: string,
		field: string,
		rowIndex: number,
		fieldIndex: number
	): void {
		const row = data.find((r) => r.id === id_row);
		if (!row) return;

		if (event.key === 'Enter') {
			finishEditing(row.id, field, event);
		} else if (event.key === 'Escape') {
			editingCell = null;
		} else if (event.key === 'Tab') {
			handleTabKey(id_row, event, rowIndex, fieldIndex);
		}
	}

	function handleButtonClick(button: DataGridButton) {
		if (button.type === 'checkbox') {
			button.checked = !button.checked;
		}
		button.onclick(button.checked);
	}

	function handleInput(event: Event, field: DataGridField): void {
		const input = event.target as HTMLInputElement;
		let value = input.value;

		if (field.options?.lower) value = value.toLowerCase();

		if (field.options?.validChars) {
			value = value
				.split('')
				.filter((char) => field.options!.validChars!.includes(char))
				.join('');
		}

		input.value = value;
	}

	function handlePaste(event: ClipboardEvent, field: DataGridField): void {
		event.preventDefault();
		const input = event.target as HTMLInputElement;
		const pastedText = event.clipboardData?.getData('text') || '';
		let value = pastedText;

		if (field.options?.lower) value = value.toLowerCase();

		if (field.options?.validChars) {
			value = value
				.split('')
				.filter((char) => field.options!.validChars!.includes(char))
				.join('');
		}

		const start = input.selectionStart || 0;
		const end = input.selectionEnd || 0;
		const currentValue = input.value;
		input.value = currentValue.slice(0, start) + value + currentValue.slice(end);
		input.setSelectionRange(start + value.length, start + value.length);
	}

	const _numeric_limit = (input: HTMLInputElement, value: number, field: DataGridField) => {
		if (!isNaN(value)) {
			if (field.options?.min !== undefined) {
				value = Math.max(field.options?.min, value);
			}
			if (field.options?.max !== undefined) {
				value = Math.min(field.options?.max, value);
			}
			input.value = value.toString();
		}
	};

	function handleNumericInput(event: Event, field: DataGridField): void {
		const input = event.target as HTMLInputElement;
		let value = input.valueAsNumber;

		_numeric_limit(input, value, field);
	}

	function handleNumericPaste(event: ClipboardEvent, field: DataGridField): void {
		event.preventDefault();
		const input = event.target as HTMLInputElement;
		const pastedText = event.clipboardData?.getData('text') || '';
		let value = parseFloat(pastedText);

		_numeric_limit(input, value, field);
	}

	const viewModes = ['condensed', 'comfy', 'large'];
	const changeViewMode = (mode: string) => {
		viewMode = mode;
		if (mode === 'condensed') {
			buttonSize = 'xs';
		} else if (mode === 'comfy') {
			buttonSize = 'md';
		} else {
			buttonSize = 'lg';
		}
	};

	const _do_filter = (filters: Record<string, any>) => {
		dontSendPaginationChange = true;
		paginator && paginator.resetPage();
		if (onfilterchange) onfilterchange(filters);
	};

	const filter_oninput = (e: Event) => {
		if (!keyboardInputTimeout) return;

		// if the user stops inserting chars, the filter_change() is triggered
		let input = e.target as HTMLInputElement;
		clearTimeout(kiTimeout);
		kiTimeout = setTimeout(() => {
			filter_change(e);
		}, keyboardInputTimeout);
	};

	const filter_change_range = (e: Event) => {
		const input = e.target as HTMLInputElement;
		let full_name = input.name.replace('f_', '');
		let name = full_name.slice(0, -2);
		let v1, v2;

		if (full_name.endsWith('_1')) {
			v1 = input.value;
			v2 = (document.querySelector(`input[name="f_${name}_2"]`) as HTMLInputElement)?.value;
		} else {
			v1 = (document.querySelector(`input[name="f_${name}_1"]`) as HTMLInputElement)?.value;
			v2 = input.value;
		}

		const field = fields.find((f) => f.name === name);
		let mode = field?.searchMode || filterModes.BETWEEN;

		if (typeof v1 == 'undefined' || typeof v2 == 'undefined') return;
		if (!v1 || !v2) return;

		let new_filters = {
			...filters,
			[name]: {
				mode,
				value: `${v1}|${v2}`,
				type: field?.type || 'string'
			}
		};

		// remove from new_filters the filters that have an empty value
		for (const key in new_filters) {
			const filter = new_filters[key];
			if (!filter.value) delete new_filters[key];
		}

		filters = new_filters;

		_do_filter(filters);
	};

	const filter_change = (e: Event) => {
		const input = e.target as HTMLInputElement;
		let full_name = input.name.replace('f_', '');
		let name = full_name;

		if (full_name.endsWith('_1') || full_name.endsWith('_2')) {
			name = name.slice(0, -2);
		}

		const field = fields.find((f) => f.name === name);
		let mode = field?.searchMode || filterModes.CONTAINS;

		if (full_name.endsWith('_1')) {
			mode = filterModes.GREATER_THAN_OR_EQUAL;
		} else if (full_name.endsWith('_2')) {
			mode = filterModes.LESS_THAN_OR_EQUAL;
		}

		let value: any = input.value;
		let type = field?.type || 'string';

		// we add to the query only checkboxes that are set to true
		if (input.type == 'checkbox' && toBool(value) == false) {
			const nf = { ...filters };
			delete nf[name];

			filters = nf;
			return _do_filter(filters);
		} else if (input.type == 'checkbox' && toBool(value) == true) {
			value = true;
		}

		let new_filters = {
			...filters,
			[name]: {
				mode,
				value,
				type
			}
		};

		// remove from new_filters the filters that have an empty value
		for (const key in new_filters) {
			const filter = new_filters[key];
			if (!filter.value) delete new_filters[key];
		}

		filters = new_filters;

		_do_filter(filters);
	};

	const internalPageChange = (page_: number, rows: number) => {
		if (onpagechange && !dontSendPaginationChange) {
			onpagechange(page_, rows);
			dontSendPaginationChange = false;
			return;
		}

		dontSendPaginationChange = false;

		page = page_;
	};
</script>

{#snippet filtersRow()}
	<!-- filters -->
	{#if has_filters}
		<tr style="background-color: var(--liwe3-lighter-paper)">
			{#each fields as field}
				{#if !field.hidden}
					<td class="filter" style={`width: ${field.width || 'min-content'};`}>
						{#if field.filterable}
							{#if field.options?.filterSelect}
								<select
									name={`f_${field.name}`}
									onchange={filter_change}
									value={filters[field.name]?.value}
								>
									<option value="">(Select)</option>
									{#each field.options.filterSelect as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							{:else if field.type == 'string' || field.type == 'text'}
								<Input
									{mode}
									width={field.width}
									size="xs"
									name={`f_${field.name}`}
									onchange={filter_change}
									oninput={filter_oninput}
									value={filters[field.name]?.value}
								/>
							{:else if field.type == 'number'}
								{@const fn1 = `f_${field.name}_1`}
								{@const fn2 = `f_${field.name}_2`}
								<Input
									{mode}
									size="xs"
									type="number"
									name={fn1}
									onchange={filter_change}
									value={filters[fn1]?.value}
								/>
								<Input
									{mode}
									size="xs"
									type="number"
									name={fn2}
									value={filters[fn2]?.value}
									onchange={filter_change}
								/>
							{:else if ['date', 'datetime', 'datetimelocal'].indexOf(field.type) != -1}
								{@const fn1 = `f_${field.name}_1`}
								{@const fn2 = `f_${field.name}_2`}
								<Input
									{mode}
									size="xs"
									type={field.type}
									name={fn1}
									value={filters[fn1]?.value}
									onchange={filter_change_range}
								/>
								<Input
									{mode}
									size="xs"
									type={field.type}
									name={fn2}
									value={filters[fn2]?.value}
									onchange={filter_change_range}
								/>
							{:else if ['bool', 'boolean', 'checkbox'].indexOf(field.type) != -1}
								<Checkbox
									{mode}
									name={`f_${field.name}`}
									size="xs"
									onchange={filter_change}
									checked={toBool(filters[field.name]?.value)}
								/>
							{/if}
						{/if}
					</td>
				{/if}
			{/each}
			{#if actions && actions.length > 0}
				<td></td>
			{/if}
		</tr>
	{/if}
{/snippet}

{#snippet titleBar()}
	{#if title || buttons}
		<div class="title-bar">
			<div class="title">
				<Button size="xs" onclick={() => (showFieldsModal = true)}>Fields</Button>
				{title}
			</div>

			<div class="view-modes">
				<div class="mode1 radio-group liwe3-form-radio-group">
					{#each viewModes as vm}
						<input
							type="radio"
							id={`swicth-${vm}`}
							name="viewMode"
							checked={vm === viewMode}
							onchange={() => changeViewMode(vm)}
						/>
						<label for={`swicth-${vm}`}>{vm}</label>
					{/each}
				</div>
			</div>

			{#if buttons}
				<div class="buttons">
					{#each buttons as button}
						{#if button.type === 'checkbox'}
							<Checkbox
								size="md"
								mode={button.mode || mode}
								checked={button.checked || false}
								onchange={() => handleButtonClick(button)}
								label={button.label}
							/>
						{:else}
							<Button
								size="md"
								mode={button.mode || mode}
								variant={button.variant}
								icon={button.icon}
								onclick={() => handleButtonClick(button)}
							>
								{button.label}
							</Button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet tableHeaders()}
	<tr>
		{#each fields as field}
			{#if !field.hidden}
				<th onclick={() => sortData(field.name)}>
					{field.label || field.name}
					{#if field.sortable && sortField === field.name}
						{sortDirection === 'asc' ? '▲' : '▼'}
					{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="resizer" onmousedown={(e) => startResize(e, field.name)}></div>
				</th>
			{/if}
		{/each}
		{#if actions && actions.length > 0}
			<th class="actions-header">Actions</th>
		{/if}
	</tr>
{/snippet}

{#snippet editField(row: DataGridRow, field: DataGridField, rowIndex: number)}
	{#if field.options?.select}
		<!-- Use select input if selectOptions are provided -->
		<select
			value={row[field.name]}
			onblur={(e) => finishEditing(row.id, field.name, e)}
			onchange={(e) => finishEditing(row.id, field.name, e)}
			onkeydown={(e) => handleKeyDown(e, row.id, field.name, rowIndex, fields.indexOf(field))}
			data-row={rowIndex}
			data-field={field.name}
		>
			{#each field.options.select as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	{:else if field.type === 'number'}
		<input
			type="text"
			pattern="[0-9]*[.]?[0-9]*"
			value={row[field.name]}
			min={field.options?.min}
			max={field.options?.max}
			onblur={(e) => finishEditing(row.id, field.name, e)}
			onkeydown={(e) => handleKeyDown(e, row.id, field.name, rowIndex, fields.indexOf(field))}
			oninput={(e) => handleNumericInput(e, field)}
			onpaste={(e) => handleNumericPaste(e, field)}
			data-row={rowIndex}
			data-field={field.name}
		/>
	{:else}
		<!-- Existing text input logic -->
		<input
			type="text"
			value={row[field.name]}
			onblur={(e) => finishEditing(row.id, field.name, e)}
			onkeydown={(e) => handleKeyDown(e, row.id, field.name, rowIndex, fields.indexOf(field))}
			oninput={(e) => handleInput(e, field)}
			onpaste={(e) => handlePaste(e, field)}
			data-row={rowIndex}
			data-field={field.name}
		/>
	{/if}
{/snippet}

{#snippet renderActions(actions: DataGridAction[] | undefined, row: DataGridRow)}
	{#if actions && actions.length > 0}
		<td class="actions-cell">
			<div class="actions">
				{#each actions as action}
					{#if !action.hide}
						<Button
							size={buttonSize}
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
					{/if}
				{/each}
			</div>
		</td>
	{/if}
{/snippet}

<div class="dg-container">
	<div class="dg-header">
		{@render titleBar()}
	</div>
	<div class="dg-body">
		<div bind:this={dataView} class="dataview">
			<table bind:this={tableElement} class={viewMode}>
				<thead>
					{@render tableHeaders()}
					{@render filtersRow()}
				</thead>
				<tbody>
					{#each paginatedData as row, rowIndex}
						<tr>
							{#each fields as field}
								{#if !field.hidden}
									<td
										ondblclick={() => startEditing(rowIndex, field.name)}
										style:text-align={field.align}
										class:editable={field.editable}
									>
										{#if editingCell && editingCell.rowIndex === rowIndex && editingCell.field === field.name}
											{@render editField(row, field, rowIndex)}
										{:else if field.render}
											{#if field.onclick}
												<Button
													mode="mode4"
													size="sm"
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
													if (field.onclick) field.onclick(row);
												}}
											/>
										{:else if field.onclick}
											<Button
												mode="mode4"
												size="sm"
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
							{@render renderActions(actions, row)}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{#if !disablePaginator}
		<div class="dg-footer">
			<Paginator
				bind:this={paginator}
				total={totRows}
				rows={rowsPerPage}
				onpagechange={internalPageChange}
				buttons={paginatorButtons}
			/>
		</div>
	{/if}
</div>

{#if showFieldsModal}
	<Modal
		title="Fields show"
		onclose={() => (showFieldsModal = false)}
		oncancel={() => (showFieldsModal = false)}
	>
		<div class="fields-cont">
			{#each fields as field}
				<div class="field">
					<Checkbox
						checked={!field.hidden}
						onchange={(e: any) => (field.hidden = !e.target?.checked)}
						label={field.label || field.name}
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

	.dg-container {
		display: flex;
		flex-direction: column;
		height: 100%; /* Or a specific height */
		min-height: 250px;
		border: 1px solid var(--liwe3-datagrid-container-border, var(--liwe3-button-border));
		border-radius: var(--liwe3-border-radius);
		overflow: hidden; /* Hide overflow */
		width: 100%;
	}

	.dg-header {
		flex: 0 0 auto; /* Don't grow or shrink */
		background-color: var(--liwe3-datagrid-container-header-bg, var(--liwe3-darker-paper));
		z-index: 2; /* Ensure it's above the scrolling content */
	}

	.dg-body {
		flex: 1 1 auto; /* Grow and shrink as needed */
		overflow: auto; /* Enable scrolling */
		position: relative; /* For positioning the table header */
	}

	.dg-container2 {
		display: flex;
		flex-direction: column;

		position: relative;
		width: 100%;
		height: 100%;

		min-height: 250px;

		border: 1px solid var(--liwe3-datagrid-container2-border, var(--liwe3-button-border));
		border-radius: var(--liwe3-border-radius);
	}

	.dataview {
		height: 100%;
	}

	.dataview2 {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto; /* Allow it to grow and shrink */
		overflow: auto; /* Enable scrolling */

		position: relative;

		width: 100%;

		scrollbar-width: thin;
		scrollbar-color: var(--liwe3-datagrid-scrollbar-track, var(--liwe3-darker-paper))
			var(--liwe3-datagrid-scrollbar-thumb, var(--liwe3-paper));

		background-color: var(--liwe3-datagrid-bg, var(--liwe3-paper));
		color: var(--liwe3-datagrid-color, var(--liwe3-color));

		font-size: var(--table-font-size);
		font-family: var(--table-font-family);

		border-radius: var(--liwe3-border-radius);
	}

	.title-bar {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 4px;

		background-color: var(--liwe3-datagrid-title-bg, var(--liwe3-darker-paper));
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
		top: 0;
		z-index: 1;
		background-color: var(--liwe3-datagrid-head-bg, var(--liwe3-darker-paper));
	}

	.dg-footer {
		flex: 0 0 auto; /* Don't grow or shrink */
		background-color: var(--liwe3-datagrid-footer-bg, var(--liwe3-darker-paper));
		z-index: 2; /* Ensure it's above the scrolling content */
	}

	th,
	td {
		text-align: left;
		border: 1px solid var(--liwe3-datagrid-td-border-color, var(--liwe3-secondary-color));
	}

	th {
		padding: 8px;
		/*background-color: var(--liwe3-darker-paper);*/
	}

	thead > tr:first-child {
		background-color: var(--liwe3-datagrid-header-bg, var(--liwe3-secondary-color));
	}

	thead tr:hover {
		background-color: var(--liwe3-datagrid-header-bg, var(--liwe3-secondary-color)) !important;
	}

	.full-width,
	.condensed,
	.confy,
	.large {
		width: 100%;
		min-width: 100%;
	}

	.condensed td {
		padding: 0.3rem;
		font-size: 0.8rem;
	}

	.comfy td {
		padding: 0.5rem;
		font-size: 1rem;
	}

	.large td {
		padding: 1.4rem;
		font-size: 1.1rem;
	}

	th {
		cursor: pointer;
		position: relative;
		/*background-color: var(--liwe3-secondary-color);*/
		user-select: none;
	}

	tr {
		border-bottom: 1px solid var(--liwe3-datagrid-tr-border-color, var(--liwe3-tertiary-color));
		max-height: 2rem;
	}

	tr:hover {
		background-color: var(--liwe3-datagrid-tr-hover, var(--liwe3-secondary-color)) !important;
	}

	td {
		border-right: 1px solid var(--liwe3-datagrid-td-border-color, var(--liwe3-button-border));
	}

	tbody tr:nth-child(even) {
		background-color: var(--liwe3-datagrid-tr-even-bg, var(--liwe3-darker-paper));
	}

	.resizer {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		width: 5px;
		background: var(--liwe3-datagrid-th-resizer-bg, var(--liwe3-mode2-600));
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

	td.editable {
		cursor: pointer;
		position: relative;
		padding-left: 1.5rem;
	}

	td.editable::before {
		content: '';
		position: absolute;
		top: 0.2rem;
		right: 0.2rem;
		width: 0.7rem;
		height: 0.7rem;
		background-image: url('data:image/svg+xml;utf8,<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path> </svg>');
		background-size: contain;
		background-repeat: no-repeat;
		/*transform:
            height 0.8s ease,
            width 0.8s ease;*/
	}

	/*
    td.editable:hover::before {
        width: 1rem;
        height: 1rem;
    }
        */

	table.condensed {
		td.editable::before {
			top: 0.5rem;
		}
		/*
        td.editable:hover::before {
            width: .9rem;
            height: .9rem;
        }
        */
	}

	/*
    table.large {
        td.editable::before {
            top: 2rem;
        }
    }
        */
</style>
