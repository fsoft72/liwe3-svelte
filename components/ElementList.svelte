<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import { Icon, Trash } from 'svelte-hero-icons';
	import type { Color } from '$liwe3/types/types';

	const dispatch = createEventDispatcher();

	export let value: string = '';
	export let name: string = '';
	export let mode: Color = 'mode1';

	let items: string[] = [];
	let jitems: string = '';

	function addItem(e: any = null) {
		if (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}

		items = [...items, ''];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function updateItem(index: number, value: string) {
		items = items.map((item, i) => (i === index ? value : item));
	}

	function handleDragStart(event: DragEvent, index: number) {
		event.dataTransfer!.setData('text/plain', index.toString());
	}

	function handleDrop(event: DragEvent, index: number) {
		const sourceIndex = parseInt(event.dataTransfer!.getData('text/plain'));
		const sourceItem = items[sourceIndex];
		const targetItem = items[index];
		items = items.map((item, i) => {
			if (i === sourceIndex) return targetItem;
			if (i === index) return sourceItem;
			return item;
		});
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	const onKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.stopImmediatePropagation();
			e.preventDefault();
			addItem();
		}
	};

	onMount(() => {
		addItem();
	});

	$: {
		if (Array.isArray(value)) {
			items = value;
		} else {
			const p = (value || '')
				.split('|')
				.filter((item) => item !== '')
				.map((item) => item.trim());

			items = p;
		}
	}

	$: jitems = items.join('|').replace(/\|$/, '');
	$: dispatch('change', jitems);
</script>

<div class={mode}>
	<input type="hidden" {name} bind:value={jitems} />
	{#each items as item, index (index)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="row"
			draggable="true"
			on:dragstart={(event) => handleDragStart(event, index)}
			on:drop={(event) => handleDrop(event, index)}
			on:dragover={handleDragOver}
			role="listbox"
			tabindex="-1"
		>
			<Input
				{mode}
				type="text"
				autofocus
				bind:value={item}
				on:input={() => updateItem(index, item)}
				on:keypress={onKeyPress}
			/>
			<Button mode="error" on:click={(e) => removeItem(index)}>
				<Icon src={Trash} size="24" />
			</Button>
		</div>
	{/each}
	<Button {mode} on:click={addItem}>Add</Button>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		align-content: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
</style>
