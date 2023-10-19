<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import AutoComplete from '$liwe3/components/AutoComplete.svelte';
	import type { Color } from '$liwe3/types/types';

	export let mode: Color = 'mode1';

	export let tags: string[] = [];
	export let selected: string[] = [];
	export let allowNewTags: boolean = false;
	export let name: string = '';
	export let value: string = '';

	let finalValue = '';

	const dispatch = createEventDispatcher();

	const set_tag = (e: CustomEvent) => {
		console.log('=== SET: ', e.detail, allowNewTags);
		const t = e.detail.trim();

		if (selected.includes(t)) return;
		if (!allowNewTags && !tags.includes(t)) return;

		if (!allowNewTags) {
			selected = [...selected, t];
		} else {
			tags = [...tags, t];
			selected = [...selected, t];
		}
	};

	const removeTag = (t: string) => {
		selected = selected.filter((tag) => tag != t);
	};

	$: finalValue = selected.join(',');
	$: {
		dispatch('change', selected);
	}

	onMount(() => {
		// if value is a list, simply assign it to selected
		if (Array.isArray(value)) {
			selected = value;
			return;
		}
		if (value) {
			selected = value.split(',');
		}
	});
</script>

<div class={`tag-input ${mode}`}>
	<input type="hidden" {name} bind:value={finalValue} />
	<AutoComplete items={tags} selectedItems={selected} {...$$restProps} on:set={set_tag} />
	<div class="tags-list">
		{#each selected as tag (tag)}
			<div class="tag">
				<div class="name">{tag}</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="btn" on:click={() => removeTag(tag)}>x</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.tag-input {
		width: 100%;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 4px;
		gap: 0.5rem;
	}

	.tag {
		display: flex;
		align-items: center;
		justify-content: space-between;

		background-color: var(--background);
		color: var(--color);
		border: 1px solid var(--border);

		font-size: 70%;

		border-radius: var(--liwe-border-radius);
	}

	.name {
		padding: 5px;
	}

	.btn {
		display: flex;
		align-items: center;

		padding: 0 2px;

		font-weight: bold;
		background-color: var(--liwe3-error-500);
		color: var(--liwe3-error-500-color);
		height: 100%;

		cursor: pointer;
	}

	.btn:hover {
		background-color: var(--liwe3-error-300);
	}
</style>
