<script lang="ts">
	import { onMount } from 'svelte';
	import AutoComplete from '$liwe3/components/AutoComplete.svelte';
	import type { Color } from '$liwe3/types/types';

	interface TagInputProps {
		mode?: Color;
		tags?: string[];
		selected?: string[];
		allowNewTags?: boolean;
		name?: string;
		value?: string | string[];

		onchange?: (value: string[]) => void;

		[key: string]: any;
	}

	let {
		mode = 'mode1',
		tags = [],
		selected = $bindable([]),
		allowNewTags = false,
		name = '',
		value = '',
		onchange,
		...restProps
	}: TagInputProps = $props();

	const set_tag = (value: string) => {
		console.log('=== SET: ', value);
		const t = value.trim();

		if (selected.includes(t)) return;
		if (!allowNewTags && !tags.includes(t)) return;

		if (!allowNewTags) {
			selected = [...selected, t];
		} else {
			tags = [...tags, t];
			selected = [...selected, t];
		}

		onchange && onchange(selected);
	};

	const removeTag = (t: string) => {
		selected = selected.filter((tag) => tag != t);
		onchange && onchange(selected);
	};

	let finalValue = $derived(selected.join(','));

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
	<input type="hidden" {name} value={finalValue} />
	<AutoComplete items={tags} selectedItems={selected} {mode} {...restProps} onset={(value:string) => {set_tag (value);}} />
	<div class="tags-list">
		{#each selected as tag (tag)}
			<div class="tag">
				<div class="name">{tag}</div>
				<button class="btn" onclick={() => removeTag(tag)}>x</button>
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

		background-color: var(--liwe3-background);
		color: var(--liwe3-color);
		border: 1px solid var(--liwe3-button-border);

		font-size: 70%;

		border-radius: var(--liwe3-border-radius);
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
