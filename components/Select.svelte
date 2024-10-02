<script module lang="ts">
	export interface SvelteItem {
		label: string;
		value: string;
	}
</script>

<script lang="ts">
	import Button from './Button.svelte';
	import { XCircle } from 'svelte-hero-icons';

	interface SelectProps {
		name: string;
		items: SvelteItem[] | string[];
		value: string | string[];
		placeholder?: string;
		readonly?: boolean;
		multiple?: boolean;
		dropdownOnly?: boolean;

		onchange?: (value: string | string[]) => void;
	}

	let {
		name = '',
		items = [],
		value = '',
		placeholder = '',
		readonly = false,
		multiple = false,
		dropdownOnly = false,
		onchange
	}: SelectProps = $props();

	let showClear: boolean = $derived(!readonly && value !== '');

	const get = (obj: any, path: string) => {
		if (typeof obj === 'string') return obj;

		return obj[path];
	};

	const clear = () => {
		value = '';
	};

	const selectChange = (e: any) => {
		value = e.target.value;

		onchange && onchange(value);
	};
</script>

<div class="container">
	{#if dropdownOnly}
		<select class="dropdown" {name} {value} {placeholder} onchange={selectChange}>
			<option value="" disabled selected hidden>{placeholder}</option>
			{#each items as item}
				<option value={get(item, 'value')}>{get(item, 'label')}</option>
			{/each}
		</select>
	{:else}
		<input class="input" {value} {placeholder} {readonly} />
	{/if}
	{#if showClear}
		<Button icon={XCircle} size="xs" variant="link" on:click={clear} />
	{:else}
		<div style="width: 24px"></div>
	{/if}
</div>

<style>
	.container {
		position: relative;

		display: flex;
		flex-direction: row;
		justify-content: center;

		border: 1px solid var(--liwe3-button-border);
		padding: 0.4rem;
		border-radius: var(--liwe3-border-radius);
		background-color: var(--liwe3-background);
	}

	.dropdown,
	.input {
		width: 100%;
		background-color: var(--liwe3-background);
	}
</style>
