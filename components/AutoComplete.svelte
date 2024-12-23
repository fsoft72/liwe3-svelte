<script lang="ts">
	import ACItem from './sub/AutoCompleteItem.svelte';
	import Input from '$liwe3/components/Input.svelte';
	import type { Color } from '$liwe3/types/types';

	interface Props {
		mode?: Color;
		items: string[];
		selectedItems?: string[];

		// events
		onset?: (value: string) => void;
		onchange?: (e: Event) => void;

		// restProps
		[k: string]: any;
	}

	let {
		mode = 'mode1',
		items = [],
		selectedItems = [],
		onset,
		onchange,
		...restProps
	}: Props = $props();

	/* FILTERING items DATA BASED ON INPUT */
	let filteredItems: string[] = $state([]);
	let value = $state('');
	let hlIndex: number | null = $state(null);

	const filter = (e: InputEvent) => {
		const input = e.target as any;
		let storageArr: string[] = [];

		if (!input) return;

		if (input.value) {
			const val = input.value.toLocaleLowerCase();
			items.forEach((item) => {
				const it = item.toLocaleLowerCase();
				if (selectedItems.includes(it)) return;
				if (item.startsWith(val)) {
					storageArr = [...storageArr, makeMatchBold(item)];
				}
			});
		}

		// remove similar items in storageArr
		storageArr = [...new Set(storageArr)];

		filteredItems = storageArr;
	};

	const setInput = (itemName: string) => {
		value = removeBold(itemName);
		onset && onset(value);

		filteredItems = [];
		hlIndex = null;
		value = '';
	};

	const makeMatchBold = (str: string) => {
		let matched = str.substring(0, value.length + 1);
		let makeBold = `<strong>${matched}</strong>`;
		let boldedMatch = str.replace(matched, makeBold);
		return boldedMatch;
	};

	const removeBold = (str: string) => {
		return str.replace(/<(.)*?>/g, '');
	};

	const onkeypress = (e: KeyboardEvent) => {
		if (e.code != 'Enter') return;
		e.stopImmediatePropagation();
		e.preventDefault();

		setInput(value);
	};

	/* NAVIGATING OVER THE LIST OF ITEMS W HIGHLIGHTING */

	$effect(() => {
		if (!value) {
			filteredItems = [];
			hlIndex = null;
		}
	});
</script>

<div class={`container ${mode}`}>
	<div class="autocomplete">
		<Input
			class="liwe3-form liwe3-form-custom-input input"
			{...restProps}
			{mode}
			type="text"
			bind:value
			{onchange}
			{onkeypress}
			oninput={filter}
		/>
	</div>

	<!-- FILTERED LIST OF ITEMS -->
	{#if filteredItems.length > 0}
		<div class={`items ${mode}`}>
			<ul class="autocomplete-items-list">
				{#each filteredItems as item, i}
					<ACItem itemLabel={item} highlighted={i === hlIndex} onclick={() => setInput(item)} />
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	div.autocomplete {
		/*the container must be positioned relative:*/
		position: relative;
		display: inline-block;
		width: 100%;
	}

	.autocomplete-items-list {
		position: relative;
		margin: 0;
		margin-left: .3rem;
		padding: 0;
		top: 0;
		width: 297px;
		border: 1px solid var(--liwe3-button-border);
		background-color: var(--liwe3-background);

		z-index: 99;

		max-height: 300px;
		overflow-y: auto;
		border-bottom-right-radius: var(--liwe3-border-radius);
		border-bottom-left-radius: var(--liwe3-border-radius);
	}

	.container {
		position: relative;
	}

	.items {
		position: absolute;
	}
</style>
