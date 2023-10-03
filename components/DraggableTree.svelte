<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { tree_add_item, tree_del_item, tree_find_item, type TreeItem } from '$liwe3/utils/tree';
	import DraggableTreeItem from './sub/DraggableTreeItem.svelte';
	import Button from './Button.svelte';
	import { tree_set_meta } from '$liwe3/utils/utils';

	// maximum number of nested folders
	export let name = '';
	export let maxDepth = 2;
	export let items: TreeItem[] = [];
	export let canAdd: boolean = true;
	export let canEdit: boolean = true;
	export let canDelete: boolean = true;
	export let value: string = '';

	export let showNew: boolean = true;
	export let newLabel: string = 'New';

	export let beforeDragInto: (source: TreeItem, target: TreeItem) => boolean = () => true;
	export let createNewItem: (parentItem?: TreeItem) => Promise<TreeItem | undefined> = async (
		parentItem?: TreeItem
	) => {
		return new Promise((resolve) => {
			resolve({
				id: new Date().getTime().toString(),
				id_parent: parentItem?.id ?? '',
				name: 'New Item',
				children: []
			});
		});
	};

	let fakeCounter = 0;

	const dispatch = createEventDispatcher();

	const onReorder = (event: CustomEvent) => {
		const { sourceId, targetId, pos } = event.detail;
		let newItems = structuredClone(items);

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

		console.log('=== SOURCE: ', sourceItem.name);
		console.log('=== TARGET: ', targetItem.name);
		console.log('=== POS: ', pos);

		// if pos == -1, append the sourceItem to the targetItem (if it has children)
		if (pos == -1) {
			if (!beforeDragInto(sourceItem, targetItem)) return;
			if ((targetItem?.level || 0) >= maxDepth) return;

			if (targetItem.children) {
				targetItem.children.push(sourceItem);
			} else {
				targetItem.children = [sourceItem];
			}

			dispatch('draginto', { sourceId, targetId, pos });
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
		items = structuredClone(newItems);

		dispatch('reorder', { items });
	};

	const onChange = (event: CustomEvent) => {
		const { items: newItems } = event.detail;
		items = structuredClone(newItems);

		dispatch('change', { items });
	};

	const onAddItem = async (event: CustomEvent) => {
		const { id_parent } = event.detail;

		const newItem: TreeItem | undefined = await createNewItem(tree_find_item(items, id_parent));

		if (!newItem) return;

		dispatch('additem', { id: newItem.id });

		items = structuredClone(tree_add_item(items, newItem, id_parent));
		dispatch('change', { items });
	};

	const onEditItem = (event: CustomEvent) => {
		const { id } = event.detail;

		dispatch('edititem', { id });

		items = structuredClone(tree_del_item(items, id));

		dispatch('change', { items });
	};

	const onDelItem = (event: CustomEvent) => {
		const { id } = event.detail;

		dispatch('delitem', { id });

		items = structuredClone(tree_del_item(items, id));

		dispatch('change', { items });
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

		dispatch('additem', { id: newItem.id });

		tree_set_meta(items, '', 0);
		items = structuredClone(items);

		dispatch('change', { items });
	};

	onMount(() => {
		if (!value) return;
		items = JSON.parse(value);
	});

	$: {
		tree_set_meta(items, '', 0);
	}
</script>

{#if showNew}
	<div class="new-item">
		<Button size="xs" on:click={newItem} disabled={!canAdd}>
			{newLabel}
		</Button>
	</div>
{/if}

<input type="hidden" {name} value={JSON.stringify(items)} />
<DraggableTreeItem
	{items}
	{canAdd}
	{canEdit}
	{canDelete}
	{maxDepth}
	on:additem={onAddItem}
	on:edititem={onEditItem}
	on:delitem={onDelItem}
	on:reorder={onReorder}
	on:change={onChange}
/>
