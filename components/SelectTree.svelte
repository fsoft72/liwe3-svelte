<script lang="ts">
	import type { Tree } from '$liwe3/utils/tree';
	import type { Color } from '$liwe3/types/types';

	interface SelectTreeProps {
		tree: Tree;
		name?: string;
		fontSize?: string;
		addEmpty?: boolean;
		value?: string;
		mode?: Color;

		onchange: (id: string) => void;
	}

	let {
		tree,
		name = '',
		fontSize = '1.2em',
		addEmpty = true,
		value = $bindable(''),
		mode = 'mode3',
		onchange
	}: SelectTreeProps = $props();

	const onChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		const id = select.value;

		onchange && onchange(id);
	};

	// recursively create the options list with these fields: id, name, spaces
	const _createOptions = (options: any[], tree: Tree, level: number = 0) => {
		tree.children.map((item) => {
			options.push({
				id: item.id,
				name: item.name,
				level,
				spaces: '&nbsp;'.repeat(level * 4)
			});

			if (item.children) {
				_createOptions(options, item as Tree, level + 1);
			}
		});

		return options;
	};
</script>

<div class={mode}>
	<select {name} class={`liwe3-form ${mode}`} style:font-size={fontSize} onchange={onChange}>
		{#if addEmpty}
			<option value="">(Select)</option>
		{/if}
		{#each _createOptions([], tree) as item (item.id)}
			<option value={item.id} selected={item.id == value}>{@html item.spaces}{item.name}</option>
		{/each}
	</select>
</div>

<style>
	select {
		min-width: 200px;
	}
</style>
