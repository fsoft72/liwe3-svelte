<!-- Example usage of VerticalDND component -->
<script lang="ts">
	import VerticalDND from '$liwe3/components/VerticalDND.svelte';

	let items = $state(['Item 0', 'Item 1', 'Item 2', 'Item 3', 'Item 4']);

	const handleReorder = (newOrder: number[]) => {
		console.log('New order:', newOrder);
		// You can reorder your data here based on the new order indices
	};
</script>

<div class="example-container">
	<h2>Vertical Drag and Drop Example</h2>

	<VerticalDND onreorder={handleReorder} placeholderText="Drop here">
		{#snippet children()}
			{#each items as item}
				<div id={item.replace(/ /g, '_').toLowerCase()} class="example-item">
					<h3>{item}</h3>
					<p>This is a draggable item. You can drag it up or down to reorder.</p>
				</div>
			{/each}
		{/snippet}
	</VerticalDND>

	<h2>Second DND Example (with ITEMS)</h2>
	<VerticalDND onreorder={handleReorder} placeholderText="Drop here" handlePosition="left" {items}>
		{#snippet children()}
			{#each items as item}
				<div id={item.replace(/ /g, '_').toLowerCase()} class="example-item">
					<h3>{item}</h3>
					<p>This is a draggable item. You can drag it up or down to reorder.</p>
				</div>
			{/each}
		{/snippet}
	</VerticalDND>
</div>

<style>
	.example-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 1rem;
	}

	.example-item {
		background: var(--liwe3-background, #fff);
		border: 1px solid var(--liwe3-border-color, #ddd);
		border-radius: var(--liwe3-border-radius, 4px);
		padding: 1rem;
		margin: 0.5rem 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.example-item h3 {
		margin: 0 0 0.5rem 0;
		color: var(--liwe3-color, #333);
	}

	.example-item p {
		margin: 0;
		color: var(--liwe3-color-secondary, #666);
		font-size: 0.9rem;
	}
</style>
