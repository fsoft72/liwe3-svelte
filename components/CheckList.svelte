<script module lang="ts">
	export type CheckListItemType = {
		id: string;
		text: string;
		completed: boolean;
	};

	export type CheckListType = {
		id: string;
		title: string;
		items: CheckListItemType[];
	};
</script>

<script lang="ts">
	import { Trash } from 'svelte-hero-icons';
	import Button from './Button.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import { mkid_simple } from '$liwe3/utils/utils';

	interface Props {
		checklist: CheckListType;

		titleEditable?: boolean;
		showDeleteCheckList?: boolean;
		showAddItem?: boolean;
		showDeleteItem?: boolean;

		// events
		ondeleteitem?: (checklistId: string, itemId: string) => void;
		ontoggleitem?: (checklistId: string, itemId: string, completed: boolean) => void;
		onadditem?: (checklistId: string, item: CheckListItemType) => void;
		onupdatetitle?: (checklistId: string, title: string) => void;

		ondeletechecklist?: (checklistId: string) => void;
	}

	let {
		checklist,
		showDeleteCheckList = true,
		showAddItem = true,
		showDeleteItem = true,
		titleEditable = true,

		ondeleteitem,
		ontoggleitem,
		onadditem,
		onupdatetitle,
		ondeletechecklist
	}: Props = $props();

	let items = $state(checklist.items);
	let title = $state(checklist.title);
	let newItemText = $state('');

	const completedCount = $derived(items.filter((item) => item.completed).length);
	const progress = $derived(items.length > 0 ? (completedCount / items.length) * 100 : 0);

	const handleToggle = (itemId: string, event: Event) => {
		const target = event.target as HTMLInputElement;
		items = items.map((item) => {
			if (item.id === itemId) {
				return { ...item, completed: target.checked };
			}
			return item;
		});
		ontoggleitem?.(checklist.id, itemId, target.checked);
	};

	const handleAddItem = () => {
		if (newItemText.trim()) {
			const it: CheckListItemType = {
				id: mkid_simple('it'),
				text: newItemText.trim(),
				completed: false
			};

			onadditem?.(checklist.id, it);
			newItemText = ''; // Clear input
		}
	};

	const handleAddItemKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleAddItem();
		}
	};

	const handleDelItem = (checklistId: string, itemId: string) => {
		// items = items.filter((item) => item.id !== itemId);
		ondeleteitem?.(checklistId, itemId);
	};
</script>

<div class="checklist-container">
	<div class="section-header">
		{#if titleEditable}
			<input
				type="text"
				bind:value={title}
				class="checklist-title-input"
				placeholder="Checklist title"
				oninput={(e) => {
					const target = e.target as HTMLInputElement;
					onupdatetitle?.(checklist.id, target.value);
				}}
			/>
		{:else}
			<span class="sect-title">{checklist.title}</span>
		{/if}
		{#if showDeleteCheckList && ondeletechecklist}
			<button class="delete-checklist-button" onclick={() => ondeletechecklist?.(checklist.id)}>
				Delete
			</button>
		{/if}
	</div>

	<ProgressBar percentage={progress} mode="mode4" />

	<div class="checklist-items">
		{#each checklist.items as item (item.id)}
			<div class="checklist-item">
				<input
					type="checkbox"
					id={`item-${item.id}`}
					bind:checked={item.completed}
					onchange={(e) => handleToggle(item.id, e)}
				/>
				<label for={`item-${item.id}`} class:completed={item.completed}>{item.text}</label>
				{#if showDeleteItem}
					<Button
						class="danger"
						size="xs"
						icon={Trash}
						aria-label="Delete item"
						onclick={() => handleDelItem(checklist.id, item.id)}
					></Button>
				{/if}
			</div>
		{/each}
	</div>

	{#if showAddItem}
		<div class="add-item-section">
			<input
				type="text"
				bind:value={newItemText}
				placeholder="Add an item"
				onkeydown={handleAddItemKeydown}
			/>
			<button onclick={handleAddItem} disabled={!newItemText.trim()}>Add</button>
		</div>
	{/if}
</div>

<style>
	.checklist-container {
		background-color: var(--liwe3-paper);
		padding: 0.5rem;
		border: 1px solid var(--liwe3-border-color);
		border-radius: var(--liwe3-border-radius);
	}
	.section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}

	.checklist-title-input {
		flex-grow: 1;
		font-size: 1.1em;
		font-weight: 600;
		border: none;
		padding: 5px;
	}
	.checklist-title-input:focus {
		outline: none;
		background-color: #f4f5f7;
	}
	.delete-checklist-button {
		background-color: #f4f5f7;
		border: none;
		border-radius: 3px;
		color: #5e6c84;
		cursor: pointer;
		padding: 6px 12px;
		font-size: 0.9em;
	}
	.delete-checklist-button:hover {
		background-color: #e2e4e9;
	}

	.checklist-items {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin: 10px 0;
	}
	.checklist-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.checklist-item input[type='checkbox'] {
		width: 16px;
		height: 16px;
	}
	.checklist-item label {
		flex-grow: 1;
		color: #172b4d;
	}
	.checklist-item label.completed {
		text-decoration: line-through;
		color: var(--liwe3-lighter-paper);
	}

	.add-item-section {
		display: flex;
		gap: 8px;
	}
	.add-item-section input[type='text'] {
		flex-grow: 1;
		padding: 6px 12px;
		border: 1px solid #dfe1e6;
		border-radius: 3px;
	}
	.add-item-section button {
		background-color: #f4f5f7;
		border: none;
		border-radius: 3px;
		color: #172b4d;
		cursor: pointer;
		padding: 6px 12px;
		font-size: 0.9em;
	}
	.add-item-section button:disabled {
		background-color: #f4f5f7;
		color: #a5adba;
		cursor: not-allowed;
	}
	.add-item-section button:not(:disabled):hover {
		background-color: #e2e4e9;
	}
</style>
