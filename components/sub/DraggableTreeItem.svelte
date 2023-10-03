<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { Icon, ChevronDown, ChevronRight, Trash, Plus, PencilSquare } from 'svelte-hero-icons';
	import type { TreeItem } from '$liwe3/utils/tree';
	import Button from '../Button.svelte';

	export let items: TreeItem[] = [];

	export let canAdd: boolean = true;
	export let canDelete: boolean = true;
	export let canEdit: boolean = true;

	export let maxDepth: number = 2;

	let dragItem: TreeItem | null;
	let overItem: TreeItem | null;

	const dispatch = createEventDispatcher();

	function onDragStart(event: DragEvent, item: TreeItem) {
		dragItem = item;
		event.dataTransfer!.setData('text/plain', item.id); // required for Firefox
		event.dataTransfer!.effectAllowed = 'move';
		event.dataTransfer!.dropEffect = 'move';
	}

	function onDragOver(event: DragEvent, item: TreeItem) {
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

		dispatch('reorder', {
			sourceId,
			targetId,
			pos: -1
		});
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

		dispatch('reorder', {
			sourceId,
			targetId,
			pos: item.pos
		});
	}

	const toggleOpen = (item: TreeItem) => {
		item.isOpen = !item.isOpen;
		items = items;
	};

	const addItem = (item: TreeItem) => {
		dispatch('additem', { id_parent: item.id });
	};

	const deleteItem = (item: TreeItem) => {
		dispatch('delitem', { id: item.id });
	};

	const editItem = (item: TreeItem) => {
		dispatch('edititem', { id: item.id });
	};
</script>

<div class="tree">
	{#each items as item (item.id)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="item">
			<div
				id={`emp-${item}`}
				class="bar mini"
				class:is-dragging-over={overItem?.id == `emp-${item.id}`}
				class:dashed-border={overItem?.id == `emp-${item.id}`}
				on:dragover={(event) => onOverEmpty(event, item)}
				on:drop={(event) => onDropEmpty(event, item)}
			/>
			<div
				draggable="true"
				class="bar"
				class:is-dragging-over={overItem == item}
				on:dragstart={(event) => onDragStart(event, item)}
				on:dragover={(event) => onDragOver(event, item)}
				on:dragleave={(event) => onDragLeave(event, item)}
				on:drop={(event) => onDrop(event, item)}
			>
				<div class="bar-options">
					<div class="btn">
						{#if item.children && item.children.length}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div on:click={() => toggleOpen(item)}>
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
							mode="danger"
							icon={Trash}
							on:click={() => deleteItem(item)}
							title="Delete Item"
						/>
					{/if}
					{#if canEdit}
						<Button
							size="xs"
							icon={PencilSquare}
							on:click={() => editItem(item)}
							title="Edit Item"
						/>
					{/if}
					{#if canAdd && (item.level ?? 99) < maxDepth}
						<Button
							size="xs"
							mode="success"
							icon={Plus}
							on:click={() => addItem(item)}
							title="Add new Item"
						/>
					{/if}
				</div>
			</div>
			{#if item.children}
				{#if item.children.length > 0 && item.isOpen}
					<svelte:self
						items={item.children}
						{canAdd}
						{canEdit}
						{canDelete}
						{maxDepth}
						on:reorder
						on:additem
						on:edititem
						on:delitem
						on:change
					/>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.tree {
		padding-left: 1rem;
	}

	.bar {
		border: 1px solid var(--liwe-darker-secondary-color);
		padding: 0.5rem;
		border-radius: 2px;

		margin-bottom: 0;

		display: flex;
		align-items: center;
		justify-content: space-between;

		max-width: 300px;
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
		background-color: var(--liwe-secondary-color);
	}

	.mini {
		border: 0;
		padding: 0.2rem;
	}

	.is-dragging-over {
		border: 2px dashed red;
		padding: 1rem;
	}

	.bar-options {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
