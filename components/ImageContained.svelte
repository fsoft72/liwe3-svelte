<script lang="ts">
	import { onMount } from 'svelte';

	interface ImageContainedProps {
		url?: string;
		size?: 'cover' | 'contain';
		position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
	}

	let { url = '', size = 'cover', position = 'top' }: ImageContainedProps = $props();

	let el: HTMLDivElement;
	let width: string = $state('100px');
	let height: string = $state('100px');

	let observer: IntersectionObserver;

	const imageElement = () => {
		// set the div size according to the parent size in pixels
		let parent = el.parentElement;

		// go up until we find a parent which is a div
		while (parent && parent.tagName !== 'DIV') {
			parent = parent.parentElement;
		}

		if (parent) {
			width = `${parent.clientWidth}px`;
			height = `${parent.clientHeight}px`;
			// observer needs to be called only once
			observer.unobserve(el);
		}
	};

	onMount(() => {
		observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if(entry.isIntersecting){
					imageElement();
				}
			});
		});

		observer.observe(el);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div
	bind:this={el}
	style={`width: ${width}; height: ${height}; background-image: url(${url}); background-size: ${size}; background-position: ${position};`}
></div>

<style>
	div {
		background-image: url({url});
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
