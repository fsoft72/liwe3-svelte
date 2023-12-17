<script context="module" lang="ts">
	export interface SvelteItem {
		label: string;
		value: string;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Button from './Button.svelte';
	import { XCircle } from 'svelte-hero-icons';

	export let name: string = '';
	export let items: SvelteItem[] | string[] = [];
	export let value: string | string[] = '';
	export let placeholder: string = '';
	export let readonly: boolean = false;
	export let multiple: boolean = false;
	export let dropdownOnly: boolean = false;

	let showClear: boolean = false;

	let dispatch = createEventDispatcher();

	const get = (obj: any, path: string) => {
		if (typeof obj === 'string') return obj;

		return obj[path];
	};

	const clear = () => {
		value = '';
	};

	const selectChange = (e: any) => {
		value = e.target.value;
	};

	$: showClear = !readonly && value !== '';
	$: dispatch('change', value);
</script>

<div class="container">
	{#if dropdownOnly}
		<select class="dropdown" {name} {value} {placeholder} on:change={selectChange}>
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

		border: 1px solid var(--border);
		padding: 0.4rem;
		border-radius: var(--liwe-border-radius);
		background-color: var(--background);
	}

	.dropdown,
	.input {
		width: 100%;
		background-color: var(--background);
	}
</style>
