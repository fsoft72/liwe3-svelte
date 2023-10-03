<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ACItem from './sub/AutoCompleteItem.svelte';
	import Input from '$liwe3/components/Input.svelte';

	export let items: string[] = [];
	export let selectedItems: string[] = [];

	/* FILTERING items DATA BASED ON INPUT */
	let filteredItems: string[] = [];
	let value = '';
	let hlIndex: number | null = null;
	let input: any;

	const dispatch = createEventDispatcher();

	const filter = (e: any) => {
		const input = e.detail;
		let storageArr: string[] = [];

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

		filteredItems = storageArr;
	};

	const setInput = (itemName: string) => {
		value = removeBold(itemName);
		dispatch('set', value);

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

	const onKeyPress = (e: KeyboardEvent) => {
		if (e.code != 'Enter') return;
		e.stopImmediatePropagation();
		e.preventDefault();

		setInput(value);
	};

	/* NAVIGATING OVER THE LIST OF ITEMS W HIGHLIGHTING */

	$: if (!value) {
		filteredItems = [];
		hlIndex = null;
	}
</script>

<div class="container">
	<div class="autocomplete">
		<Input
			class="input"
			{...$$restProps}
			type="text"
			bind:value
			on:change
			on:keypress={onKeyPress}
			on:input={filter}
		/>
	</div>

	<!-- FILTERED LIST OF ITEMS -->
	{#if filteredItems.length > 0}
		<div class="items">
			<ul class="autocomplete-items-list">
				{#each filteredItems as item, i}
					<ACItem itemLabel={item} highlighted={i === hlIndex} on:click={() => setInput(item)} />
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
		padding: 0;
		top: 0;
		width: 297px;
		border: 1px solid #ddd;
		background-color: #ddd;

		z-index: 99;

		max-height: 300px;
		overflow-y: auto;
	}

	.container {
		position: relative;
	}

	.items {
		position: absolute;
	}
</style>
