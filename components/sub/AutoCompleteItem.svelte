<script lang="ts">
	export let itemLabel: string;
	export let highlighted: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<li class="autocomplete-items" class:autocomplete-active={highlighted} on:click>
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
