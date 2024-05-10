<script lang="ts">
	import { onMount } from 'svelte';

	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import { Icon, Trash } from 'svelte-hero-icons';
	import type { Color } from '$liwe3/types/types';

	interface Props {
		mode?: Color;
		name?: string;
		value?: string | string[];

		onchange?: (value: string) => void;
	}

	let { mode = 'mode1', name = '', value, onchange }: Props = $props();

	let items: string[] = $state([]);

	function addItem(e: any = null) {
		if (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}

		items.push('');
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

	$effect(() => {
		if (Array.isArray(value)) {
			items = value;
		} else {
			const p = (value || '')
				.split('|')
				.filter((item) => item !== '')
				.map((item) => item.trim());

			items = p;
		}
	});

	let jitems = $derived(items.join('|').replace(/\|$/, ''));

	$effect(() => {
		onchange && onchange(jitems);
	});
</script>

<div class={mode}>
	<input type="hidden" {name} value={jitems} />
	{#each items as item, index (index)}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="row"
			draggable="true"
			ondragstart={(event) => handleDragStart(event, index)}
			ondrop={(event) => handleDrop(event, index)}
			ondragover={handleDragOver}
			role="listbox"
			tabindex="-1"
		>
			<Input
				{mode}
				type="text"
				autofocus
				bind:value={items[index]}
				oninput={() => updateItem(index, item)}
				onkeypress={onKeyPress}
			/>
			<Button mode="error" onclick={(e) => removeItem(index)}>
				<Icon src={Trash} size="24" />
			</Button>
		</div>
	{/each}
	<Button {mode} onclick={addItem}>Add</Button>
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
