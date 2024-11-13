<script lang="ts">
	import SimpleTree from './SimpleTree.svelte';
	import { Icon, ChevronDown, ChevronRight } from 'svelte-hero-icons';
	import Button from './Button.svelte';
	import { tree_set_meta, type TreeItem } from '$liwe3/utils/tree';
	import { onMount } from 'svelte';

	interface SimpleTreeProps {
		items: TreeItem[];
		level?: number;
		multipleSelection?: boolean;
		selected?: string[];
		actions?: { label: string; cback: (item: TreeItem) => void }[];
		maxLevel?: number;
		fontSize?: string;

		onselect?: (selected: string[]) => void;
	}

	let {
		items,
		level = 0,
		multipleSelection = false,
		selected = [],
		actions = [],
		maxLevel = 2,
		fontSize = '24',
		onselect
	}: SimpleTreeProps = $props();

	// takes an id and returns it with ":" appended in both ends
	const sid = (str: string = '') => {
		return `:${str}:`;
	};

	export const setSelected = (elId: string) => {
		if (!multipleSelection) selected = [];

		const id = sid(elId);

		if (!selected.includes(elId)) selected.push(id);
		else selected = selected.filter((_id) => _id !== id);

		selected = selected;

		onselect && onselect(selected);
	};

	const selectItem = (e: MouseEvent, item: TreeItem) => {
		e.stopImmediatePropagation();

		setSelected(item.id);
	};

	const toggle = (item: TreeItem) => {
		item.isOpen = !item.isOpen;
		items = items;
	};

	const onSelect = (new_selected: string[]) => {
		selected = new_selected;
		onselect && onselect(selected);
	};

	onMount(() => {
		// only the root element should set all the meta
		if (level == 0) tree_set_meta({ children: items });
	});
</script>

<ul>
	{#each items as item}
		<li>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="tree-item"
				ondblclick={(e) => selectItem(e, item)}
				onclick={() => toggle(item)}
				style={`font-size: ${fontSize}px`}
			>
				<div class:selected={selected.includes(sid(item.id))} class="row">
					{#if item.children && item.children.length > 0}
						{#if item.isOpen}
							<Icon src={ChevronDown} size={fontSize} />
						{:else}
							<Icon src={ChevronRight} size={fontSize} />
						{/if}
					{:else}
						<div style="width: 24px; display: inline-block"></div>
					{/if}

					{#if item.icon}
						<Icon src={item.icon} size={fontSize} />
					{/if}

					<span class="label">
						{item.name}
					</span>
				</div>
				<div class="actions">
					{#each actions as action}
						<Button
							size="xxs"
							variant="outline"
							onclick={(e) => {
								e.preventDefault();
								e.stopImmediatePropagation();
								action.cback(item);
							}}>{action.label}</Button
						>
					{/each}
				</div>
			</div>
			{#if item.isOpen && item.children && item.children.length > 0}
				<SimpleTree
					items={item.children}
					level={level + 1}
					{multipleSelection}
					{selected}
					{actions}
					{maxLevel}
					{fontSize}
					onselect={onSelect}
				/>
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding-left: 0;
		margin-left: 0;
		margin-block: 0;
		padding-inline: 0;
		margin-inline: 0;
	}

	li {
		margin-left: 1em;
		user-select: none;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 0.2em;
	}

	.tree-item {
		display: flex;
		align-items: center;
	}

	.tree-item:hover {
		cursor: pointer;
		background-color: var(--liwe3-secondary-color);
	}

	.selected {
		background-color: var(--liwe3-success-color);
		color: var(--liwe3-light-color);
	}

	.actions {
		margin-left: 2rem;
	}

	.label {
		white-space: nowrap;
	}
</style>
