<script lang="ts">
	import type { TreeItem } from '$liwe3/utils/tree';
	import type { Color } from '$liwe3/types/types';

	interface SelectTreeProps {
		name: string;
		tree: TreeItem[];
		level: number;
		fontSize: string;
		addEmpty: boolean;
		value: string;
		mode: Color;

		onchange: (id: string) => void;
	}

	let {
		name = '',
		tree = [],
		level = 0,
		fontSize = '1.2em',
		addEmpty = true,
		value = '',
		mode = 'mode1',
		onchange
	}: SelectTreeProps = $props();

	let spaces = $derived('&nbsp;'.repeat(level * 4));

	const onChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		const id = select.value;

		onchange && onchange(id);
	};
</script>

<div class={mode}>
	{#if level == 0}
		<select {name} style={`font-size: ${fontSize}`} onchange={onChange}>
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
