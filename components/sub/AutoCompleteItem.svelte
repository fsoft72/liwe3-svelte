<script lang="ts">
	interface AutoCompleteItemProps {
		itemLabel: string;
		highlighted: boolean;

		// events
		onclick?: (e: MouseEvent) => void;
	}

	let { itemLabel, highlighted, onclick }: AutoCompleteItemProps = $props();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li class="autocomplete-items" class:autocomplete-active={highlighted} {onclick}>
	{@html itemLabel}
</li>

<style>
	li.autocomplete-items {
		list-style: none;
		border-bottom: 1px solid var(--liwe3-button-border);
		z-index: 99;
		/*position the autocomplete items to be the same width as the container:*/
		top: 100%;
		left: 0;
		right: 0;
		padding: 10px;
		cursor: pointer;
		background-color: var(--paper);
	}

	li.autocomplete-items:hover {
		/*when hovering an item:*/
		background-color: var(--dark);
		color: white;
	}

	li.autocomplete-items:active {
		/*when navigating through the items using the arrow keys:*/
		background-color: var(--dark);
		color: #ffffff;
	}

	.autocomplete-active {
		/*when navigating through the items using the arrow keys:*/
		background-color: var(--dark);
		color: #ffffff;
	}
</style>
