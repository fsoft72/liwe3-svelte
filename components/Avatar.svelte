<script lang="ts">
	import type { Color } from '$liwe3/types/types';
	import { media_url } from '$liwe3/utils/utils';
	import { onMount } from 'svelte';

	interface _props {
		value?: any;
		url?: string;
		name?: string;
		size?: string;
		mode?: Color;
		shape?: 'circle' | 'square';
		shadow?: boolean;
		border?: string;
	}

	let {
		value = null,
		url = '',
		name = 'A',
		size,
		mode = 'mode1',
		shape = 'circle',
		shadow = false,
		border = 'none'
	}: _props = $props();

	let src = $state(url);

	onMount(() => {
		if (value) {
			if (value.avatar) url = value.avatar;
			name = `${value.name} ${value.lastname}`;
		}
		if (!url || !url.length) return;

		// absolute url are not touched
		if (url.startsWith('http')) return;

		// if it doesn't start with http, maybe it is a Media Manager ID
		src = media_url(url, '', true);
	});
</script>

<div
	class={`avatar ${mode} ${shape} ${shadow ? 'shadow' : ''}`}
	style="background-image: url({url}); width: {size}; height: {size}; border: {border}; "
>
	{#if !src}
		{#if name}
			{#each name?.split(' ') as word}
				{word[0]}
			{/each}
		{:else}
			A
		{/if}
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;

		background-size: cover;
		background-position: center;
		background-color: var(--lighter);

		border: 1px solid var(--liwe3-button-border);

		user-select: none;
	}

	.avatar.circle {
		border-radius: 50%;
	}

	.avatar.square {
		border-radius: var(--liwe3-border-radius);
	}

	.avatar.shadow {
		box-shadow: 0 0 5px rgba(1, 1, 1, 0.6);
	}
</style>
