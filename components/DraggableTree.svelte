<script lang="ts">
	import { onMount } from 'svelte';
	import { tree_add_item, tree_del_item, tree_find_item, type TreeItem } from '$liwe3/utils/tree';
	import DraggableTreeItem from './sub/DraggableTreeItem.svelte';
	import Button from './Button.svelte';
	import { tree_set_meta } from '$liwe3/utils/utils';
	import type { Color } from '$liwe3/types/types';

	type reorderEvent = {
		sourceId: string;
		targetId: string;
		pos: number;
	};

	interface Props {
		mode?: Color;
		name?: string;
		maxDepth?: number;
		items?: TreeItem[];
		canAdd?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;
		value?: string;

		showNew?: boolean;
		newLabel?: string;

		// events
		onbeforedraginto?: (source: TreeItem, target: TreeItem) => boolean;
		oncreatenewitem?: (parentItem?: TreeItem) => Promise<TreeItem | undefined>;
		ondraginto?: (sourceId: string, targetId: string, pos: number) => void;
		onreorder?: (event: reorderEvent) => void;
		onchange?: (items: TreeItem[]) => void;
		onadditem?: (id_item: string, newItem?: TreeItem) => void;
		onedititem?: (id_item: string) => void;
		ondelitem?: (id_item: string) => void;
	}

	let {
		mode = 'mode1',
		name = '',
		maxDepth = 2,
		items = $bindable([]),
		canAdd = true,
		canEdit = true,
		canDelete = true,
		value = '',
		showNew = true,
		newLabel = 'New',

		// events
		onbeforedraginto = () => true,
		oncreatenewitem = async (parentItem?: TreeItem) => {
			return new Promise((resolve) => {
				resolve({
					id: new Date().getTime().toString(),
					id_parent: parentItem?.id ?? '',
					name: `New Item ${items.length ?? 0}`,
					children: []
				});
			});
		},
		ondraginto,
		onreorder,
		onchange,
		onadditem,
		onedititem,
		ondelitem
	}: Props = $props();

	const onReorder = (event: reorderEvent) => {
		const { sourceId, targetId, pos } = event;
		let newItems = [...items];

		const sourceItem = tree_find_item(newItems, sourceId);
		const targetItem = tree_find_item(newItems, targetId);
		let parentItem = tree_find_item(newItems, sourceItem?.id_parent ?? '');

		if (!sourceItem || !targetItem) return;

		// remove the sourceItem from the sourceItem's parent
		if (parentItem) {
			parentItem.children = parentItem.children?.filter((item) => item.id !== sourceId);
		} else {
			newItems = newItems.filter((item) => item.id !== sourceId);
		}

		tree_set_meta(newItems, '', 0);

		// if pos == -1, append the sourceItem to the targetItem (if it has children)
		if (pos == -1) {
			if (!onbeforedraginto(sourceItem, targetItem)) return;
			if ((targetItem?.level || 0) >= maxDepth) return;

			if (targetItem.children) {
				targetItem.children.push(sourceItem);
			} else {
				targetItem.children = [sourceItem];
			}

			ondraginto && ondraginto(sourceId, targetId, pos);
		} else {
			parentItem = tree_find_item(newItems, targetItem.id_parent ?? '');

			// if parentItem is null, it means that the targetItem is the root
			// so we need to insert the sourceItem to the root
			if (!parentItem) {
				newItems.splice(pos, 0, sourceItem);
			} else {
				// insert the sourceItem to the targetItem's children at the specified position
				parentItem?.children?.splice(pos, 0, sourceItem);
			}
		}

		// update the items
		// items = structuredClone(newItems);
		items = [...newItems];

		tree_set_meta(items, '', 0);

		onreorder && onreorder({ sourceId, targetId, pos });
	};

	const onChange = (newItems: TreeItem[]) => {
		// items = structuredClone(newItems);

		tree_set_meta(items, '', 0);

		onchange && onchange(items);
	};

	const onAddItem = async (id_parent: string) => {
		const newItem: TreeItem | undefined = await oncreatenewitem(tree_find_item(items, id_parent));

		if (!newItem) return;

		onadditem && onadditem(newItem.id, newItem);

		// items = structuredClone(tree_add_item(items, newItem, id_parent));
		tree_add_item(items, newItem, id_parent);

		tree_set_meta(items, '', 0);
		onchange && onchange(items);
	};

	const onEditItem = (id: string) => {
		onedititem && onedititem(id);

		tree_set_meta(items, '', 0);

		onchange && onchange(items);
	};

	const onDelItem = (id: string) => {
		ondelitem && ondelitem(id);

		// items = structuredClone(tree_del_item(items, id));
		items = tree_del_item(items, id);

		// tree_set_meta(items, '', 0);

		onchange && onchange(items);
	};

	const newItem = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();

		const newItem: TreeItem = {
			id: new Date().getTime().toString(),
			id_parent: '',
			name: 'New Item',
			children: []
		};

		items.push(newItem);

		console.log('=== NEW ITEM: ', { newItem, items });

		onadditem && onadditem(newItem.id, newItem);

		tree_set_meta(items, '', 0);
		// items = structuredClone(items);

		onchange && onchange(items);
	};

	onMount(() => {
		if (!value) return;
		items = JSON.parse(value);
		tree_set_meta(items, '', 0);
	});

	/*
	$effect(() => {
		tree_set_meta(items, '', 0);
	});
	*/
</script>

<div class={`container ${mode}`}>
	{#if showNew}
		<div class="new-item">
			<Button mode="success" size="xs" onclick={newItem} disabled={!canAdd}>
				{newLabel}
			</Button>
		</div>
	{/if}

	<input type="hidden" {name} value={JSON.stringify(items)} />
	<DraggableTreeItem
		{mode}
		{items}
		{canAdd}
		{canEdit}
		{canDelete}
		{maxDepth}
		onadditem={onAddItem}
		onedititem={onEditItem}
		ondelitem={onDelItem}
		onreorder={onReorder}
		onchange={onChange}
	/>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;

		min-width: 8rem;

		background-color: var(--liwe3-paper);

		padding: 0.5rem 0.5rem 0.5rem 0;

		border: var(--liwe3-border-width) solid var(--liwe3-button-border);
		border-radius: var(--liwe3-border-radius);
	}

	.new-item {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.5rem;
	}
</style>
