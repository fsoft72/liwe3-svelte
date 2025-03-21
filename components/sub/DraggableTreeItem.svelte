<script lang="ts">
	import DraggableTreeItem from './DraggableTreeItem.svelte';
	import { Icon, ChevronDown, ChevronRight, Trash, Plus, PencilSquare } from 'svelte-hero-icons';
	import type { TreeItem } from '$liwe3/utils/tree';
	import Button from '../Button.svelte';
	import type { Color } from '$liwe3/types/types';

	interface DraggableTreeItemProps {
		items: TreeItem[];
		mode: Color;
		canAdd: boolean;
		canDelete: boolean;
		canEdit: boolean;
		maxDepth: number;
		canDragInto?: (item: TreeItem) => boolean;

		// events
		onreorder?: (event: { sourceId: string; targetId: string; pos: number }) => void;
		onchange?: (items: TreeItem[]) => void;
		onadditem?: (id_item: string, newItem?: TreeItem) => void;
		onedititem?: (id_item: string) => void;
		ondelitem?: (id_item: string) => void;
	}

	let {
		items = $bindable([]),
		mode = 'mode1',
		canAdd = true,
		canDelete = true,
		canEdit = true,
		canDragInto = (item: TreeItem) => {
			return item.level < maxDepth; // added this logic to restrict dragging into deeper levels
		},
		maxDepth = 2,

		// events
		onreorder,
		onadditem,
		onedititem,
		ondelitem,
		onchange
	}: DraggableTreeItemProps = $props();

	let dragItem: TreeItem | null = $state(null);
	let overItem: TreeItem | null = $state(null);

	function onDragStart(event: DragEvent, item: TreeItem) {
		dragItem = item;
		event.dataTransfer!.setData('text/plain', item.id); // required for Firefox
		event.dataTransfer!.effectAllowed = 'move';
		event.dataTransfer!.dropEffect = 'move';
	}

	function onDragOver(event: DragEvent, item: TreeItem) {
		if (!canDragInto(item)) {
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'none'; // Shows the "not allowed" cursor
			}
			// Don't add the "drag-over" class that would show the dashed border
			return;
		}

		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';

		overItem = item;
	}

	function onDragLeave(event: DragEvent, item: TreeItem) {
		event.preventDefault();
		overItem = null;
	}

	function onDrop(event: DragEvent, item: TreeItem) {
		event.preventDefault();

		overItem = null;
		dragItem = null;

		const sourceId = event.dataTransfer!.getData('text/plain');
		const targetId = item?.id;

		if (sourceId === targetId) return;

		onreorder && onreorder({ sourceId, targetId, pos: -1 });
	}

	function onOverEmpty(event: DragEvent, nextItem: TreeItem) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';

		overItem = { ...nextItem };
		overItem.id = `emp-${nextItem.id}`;
	}

	function onDropEmpty(event: DragEvent, item: TreeItem) {
		event.preventDefault();
		overItem = null;

		const sourceId = event.dataTransfer!.getData('text/plain');
		const targetId = item?.id;

		dragItem = null;

		if (sourceId === targetId) return;

		onreorder && onreorder({ sourceId, targetId, pos: item.pos || 0 });
	}

	const toggleOpen = (item: TreeItem) => {
		item.isOpen = !item.isOpen;
		items = items;
	};

	const addItem = (item: TreeItem) => {
		onadditem && onadditem(item.id);
	};

	const deleteItem = (item: TreeItem) => {
		ondelitem && ondelitem(item.id);
	};

	const editItem = (item: TreeItem) => {
		onedititem && onedititem(item.id);
	};
</script>

<div class={`tree ${mode}`}>
	{#each items as item (item.id)}
		<div class="item">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				id={`emp-${item.id}`}
				class="bar mini"
				class:is-dragging-over={overItem?.id == `emp-${item.id}`}
				class:dashed-border={overItem?.id == `emp-${item.id}`}
				ondragleave={(event) => onDragLeave(event, item)}
				ondragover={(event) => onOverEmpty(event, item)}
				ondrop={(event) => onDropEmpty(event, item)}
			></div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				draggable="true"
				class="bar"
				class:is-dragging-over={overItem == item}
				ondragstart={(event) => onDragStart(event, item)}
				ondragover={(event) => onDragOver(event, item)}
				ondragleave={(event) => onDragLeave(event, item)}
				ondrop={(event) => onDrop(event, item)}
			>
				<div class="bar-options">
					<div class="btn">
						{#if item.children && item.children.length}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div onclick={() => toggleOpen(item)}>
								{#if item.isOpen}
									<Icon src={ChevronDown} />
								{:else}
									<Icon src={ChevronRight} />
								{/if}
							</div>
						{/if}
					</div>
					{item.name}
				</div>
				<div class="bar-options">
					{#if canDelete}
						<Button
							size="xs"
							mode="error"
							icon={Trash}
							onclick={() => deleteItem(item)}
							title="Delete Item"
						/>
					{/if}
					{#if canEdit}
						<Button
							{mode}
							size="xs"
							icon={PencilSquare}
							onclick={() => editItem(item)}
							title="Edit Item"
						/>
					{/if}
					{console.log('=== canAdd: ', { canAdd, itemLevel: item.level, maxDepth })}
					{#if canAdd && (item.level ?? 0) < maxDepth}
						<Button
							size="xs"
							mode="success"
							icon={Plus}
							onclick={() => addItem(item)}
							title="Add new Item"
						/>
					{/if}
				</div>
			</div>
			{#if item.children}
				{#if item.children.length > 0 && item.isOpen}
					<DraggableTreeItem
						items={item.children}
						{mode}
						{canAdd}
						{canEdit}
						{canDelete}
						{maxDepth}
						{onreorder}
						{onadditem}
						{onedititem}
						{ondelitem}
						{onchange}
					/>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.tree {
		padding-left: 1rem;
		background-color: var(--liwe3-paper);
	}

	.item {
		background-color: var(--liwe3-paper);
		color: var(--liwe3-color);
	}

	.bar {
		border: 1px solid var(--liwe3-button-border);
		padding: 0.5rem;
		border-radius: var(--liwe3-border-radius);

		margin-bottom: 0;

		display: flex;
		align-items: center;
		justify-content: space-between;

		/* Add transitions for smooth highlighting effect */
		transition: all 0.2s ease-in-out;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 24px;
		height: 24px;

		margin-right: 5px;

		cursor: pointer;
	}

	.btn:hover {
		background-color: var(--lighter);
	}

	.mini {
		border: 0;
		padding: 0.2rem;

		/* Add transitions for spacing indicators too */
		transition: all 0.2s ease-in-out;
	}

	.is-dragging-over {
		border: 2px dashed yellow; /* var(--darker); */
		padding: 1rem;
	}

	.bar-options {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: 1rem;
	}
	.no-drop {
		cursor: not-allowed;
	}
</style>
