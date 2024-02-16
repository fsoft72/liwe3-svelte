<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { Icon, ChevronDown, ChevronRight } from 'svelte-hero-icons';
	import Button from './Button.svelte';
	import { tree_set_meta, type TreeItem } from '$liwe3/utils/tree';

	const dispatch = createEventDispatcher();

	export let level = 0;
	export let maxLevel: number = 2;
	export let items: TreeItem[];
	export let multipleSelection: boolean = false;
	export let selected: string[] = [];
	export let actions: { label: string; cback: (item: TreeItem) => void }[] = [];
	export let fontSize: string = '24';

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

		dispatch('select', { selected });
	};

	const selectItem = (e: MouseEvent, item: TreeItem) => {
		e.stopImmediatePropagation();

		setSelected(item.id);
	};

	const toggle = (item: TreeItem) => {
		item.isOpen = !item.isOpen;
		items = items;
	};

	const onSelect = (e: CustomEvent<{ selected: string[] }>) => {
		selected = e.detail.selected;
		dispatch('select', { selected });
	};

	onMount(() => {
		// only the root element should set all the meta
		if (level == 0) tree_set_meta(items, '', level);
	});
</script>

<ul>
	{#each items as item}
		<li>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="tree-item"
				on:dblclick={(e) => selectItem(e, item)}
				on:click={() => toggle(item)}
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
						<div style="width: 24px; display: inline-block" />
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
							on:click={(e) => {
								e.preventDefault();
								e.stopImmediatePropagation();
								action.cback(item);
							}}>{action.label}</Button
						>
					{/each}
					<!--
					{#if typeof item.level != 'undefined' && item.level < maxLevel}
						<Button
							size="xxs"
							variant="primary"
							on:click={(e) => {
								e.stopImmediatePropagation();
								dispatch('add', { id_parent: item.id });
							}}>Add</Button
						>
					{/if}
						-->
				</div>
			</div>
			{#if item.isOpen && item.children && item.children.length > 0}
				<svelte:self
					items={item.children}
					level={level + 1}
					{multipleSelection}
					{selected}
					{actions}
					{maxLevel}
					{fontSize}
					on:select={onSelect}
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
