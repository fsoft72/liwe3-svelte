<script lang="ts">
	import { onMount } from 'svelte';

	export let url: string = '';

	export let size: 'cover' | 'contain' = 'cover';
	export let position: 'center' | 'top' | 'bottom' | 'left' | 'right' = 'top';

	let el: HTMLDivElement;
	let width: string = '100px';
	let height: string = '100px';

	onMount(() => {
		// set the div size according to the parent size in pixels
		let parent = el.parentElement;

		// go up until we find a parent which is a div
		while (parent && parent.tagName !== 'DIV') {
			parent = parent.parentElement;
		}

		if (parent) {
			width = `${parent.clientWidth}px`;
			height = `${parent.clientHeight}px`;
		}
	});
</script>

<div
	bind:this={el}
	style={`width: ${width}; height: ${height}; background-image: url(${url}); background-size: ${size}; background-position: ${position};`}
/>

<style>
	div {
		background-image: url({url});
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
