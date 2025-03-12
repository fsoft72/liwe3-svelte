<script lang="ts">
	import {
		tree_add_item,
		tree_del_item,
		tree_find_item,
		type TreeItem,
		type Tree,
		tree_set_meta
	} from '$liwe3/utils/tree';
	import DraggableTreeItem from './sub/DraggableTreeItem.svelte';
	import Button from './Button.svelte';
	import type { Color } from '$liwe3/types/types';

	type reorderEvent = {
		sourceId: string;
		targetId: string;
		pos: number;
	};

	interface Props {
		tree: Tree;

		mode?: Color;
		name?: string;
		maxDepth?: number;
		canAdd?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;

		showNew?: boolean;
		newLabel?: string;

		debug?: boolean;

		// events
		onbeforedraginto?: (source: TreeItem, target: TreeItem) => boolean;
		oncreatenewitem?: (parentItem?: TreeItem) => Promise<TreeItem | undefined>;
		ondraginto?: (sourceId: string, targetId: string, pos: number) => void;
		onreorder?: (event: reorderEvent) => void;
		onchange?: (tree: Tree) => void;
		onadditem?: (item: TreeItem) => void;
		onedititem?: (item: TreeItem) => void;
		ondelitem?: (item: TreeItem) => void;
	}

	let {
		tree: origTree,
		mode = 'mode1',
		maxDepth = 2,
		canAdd = true,
		canEdit = true,
		canDelete = true,
		showNew = true,
		newLabel = 'New',
		debug = false,

		// events
		onbeforedraginto = () => true,
		oncreatenewitem = async (parentItem?: TreeItem) => {
			return new Promise((resolve) => {
				resolve({
					id: new Date().getTime().toString(),
					id_parent: parentItem?.id ?? '',
					name: `New Item ${tree.children.length ?? 0}`,
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

	let tree: Tree = $state({ ...origTree });

	const onReorder = (event: reorderEvent) => {
		const { sourceId, targetId, pos } = event;
		let tmpTree: Tree = { children: tree.children };

		const sourceItem = tree_find_item(tmpTree, sourceId);
		const targetItem = tree_find_item(tmpTree, targetId);
		let parentItem = tree_find_item(tmpTree, sourceItem?.id_parent ?? '');

		if (!sourceItem || !targetItem) return;

		// Check constraints BEFORE removing the item from its original position
		if (pos == -1) {
			// We're trying to append the sourceItem to the targetItem
			if (!onbeforedraginto(sourceItem, targetItem)) return;
			if ((targetItem?.level || 0) >= maxDepth) return;
		}

		// Remove the sourceItem from the sourceItem's parent
		if (parentItem) {
			parentItem.children = parentItem.children?.filter((item) => item.id !== sourceId);
		} else {
			tmpTree.children = tmpTree.children.filter((item) => item.id !== sourceId);
		}

		tree_set_meta(tmpTree);

		// if pos == -1, append the sourceItem to the targetItem (if it has children)
		if (pos == -1) {
			if (targetItem.children) {
				targetItem.children.push(sourceItem);
			} else {
				targetItem.children = [sourceItem];
			}

			ondraginto && ondraginto(sourceId, targetId, pos);
		} else {
			parentItem = tree_find_item(tmpTree, targetItem.id_parent ?? '');

			// if parentItem is null, it means that the targetItem is the root
			// so we need to insert the sourceItem to the root
			if (!parentItem) {
				tmpTree.children.splice(pos, 0, sourceItem);
			} else {
				// insert the sourceItem to the targetItem's children at the specified position
				parentItem?.children?.splice(pos, 0, sourceItem);
			}
		}

		// update the items
		tree.children = [...tmpTree.children];

		tree_set_meta(tree);

		onreorder && onreorder({ sourceId, targetId, pos });
	};

	const onChange = () => {
		console.log('=== Tree onChange');
		tree_set_meta(tree);

		onchange && onchange(tree);
	};

	const onAddItem = async (id_parent: string) => {
		const newItem: TreeItem | undefined = await oncreatenewitem(tree_find_item(tree, id_parent));

		console.log('=== addItem', { id_parent, newItem });

		if (!newItem) return;

		onadditem && onadditem(newItem);

		tree_add_item(tree, newItem, id_parent);

		onchange && onchange(tree);
	};

	const onEditItem = (id: string) => {
		const item = tree_find_item(tree, id);

		console.log('=== editItem', { id, item });

		if (!item) return;

		onedititem && onedititem(item);
	};

	const onDelItem = async (id: string) => {
		const item = tree_find_item(tree, id);

		console.log('=== delItem', { id, item });

		if (!item) return;

		// ondelitem can return `true` to prevent the default behavior
		const res = ondelitem?.(item);

		if (res) return;

		tree_del_item(tree, id);
		onchange && onchange(tree);
	};

	const newItem = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();

		const newItem: TreeItem | undefined = await oncreatenewitem();

		if (!newItem) return;

		tree_add_item(tree, newItem, '');

		onadditem && onadditem(newItem);
		onchange && onchange(tree);
	};
</script>

<div class={`container ${mode}`}>
	{#if showNew}
		<div class="new-item">
			<Button mode="success" size="xs" onclick={newItem} disabled={!canAdd}>
				{newLabel}
			</Button>
		</div>
	{/if}

	<DraggableTreeItem
		{mode}
		bind:items={tree.children}
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
{#if debug}
	<div class="debug">
		<pre>{JSON.stringify(tree, null, 2)}</pre>
	</div>
{/if}

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

	.debug {
		position: absolute;
		top: 0;
		right: 0;
		width: 50%;
		max-width: 400px;

		border: 1px solid var(--liwe3-border-color);
		border-radius: var(--liwe3-border-radius);
		padding: 0.5rem;
		margin: 0.5rem;

		max-height: 90vh;
		overflow: auto;
		scrollbar-width: thin;

		pre {
			font-size: 70%;
		}
	}
</style>
