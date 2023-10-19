<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TreeItem } from '$liwe3/utils/tree';
	import type { Color } from '$liwe3/types/types';

	export let name: string = '';
	export let tree: TreeItem[] = [];
	export let level: number = 0;
	export let fontSize: string = '1.2em';
	export let addEmpty: boolean = true;
	export let value: string = '';
	export let mode: Color = 'mode1';

	let spaces = '';

	const dispatch = createEventDispatcher();

	const onChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		const id = select.value;

		dispatch('change', { id });
	};

	$: spaces = '&nbsp;'.repeat(level * 4);
</script>

<div class={mode}>
	{#if level == 0}
		<select {name} style={`font-size: ${fontSize}`} on:change={onChange}>
			{#if addEmpty}
				<option value="">-</option>
			{/if}
			{#each tree as item (item.id)}
				<option value={item.id} selected={item.id == value}>{item.name}</option>
				{#if item.children && item.children.length}
					<svelte:self tree={item.children} level={level + 1} on:change {value} />
				{/if}
			{/each}
		</select>
	{:else}
		{#each tree as item (item.id)}
			<option value={item.id} selected={item.id == value}>{@html spaces}{item.name}</option>
			{#if item.children && item.children.length}
				<svelte:self tree={item.children} level={level + 1} on:change {value} />
			{/if}
		{/each}
	{/if}
</div>

<style>
	select {
		min-width: 200px;
	}
</style>
