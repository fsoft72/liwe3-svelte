<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { Color, Size, Variant } from '$liwe3/types/types';
	import { Icon } from 'svelte-hero-icons';
	import type { IconSource } from 'svelte-hero-icons';

	export let size: Size = 'md';
	export let cssClass: string = '';
	export let mode: Color = 'primary';
	export let variant: Variant = 'solid';
	export let icon: IconSource | null = null;
	export let iconRight: IconSource | null = null;
	export let solid: boolean = true;
	export let parentVars: boolean = false;

	const dispatch = createEventDispatcher();

	const iconSizes = {
		xxs: '0.6rem',
		xs: '0.8rem',
		sm: '0.8rem',
		md: '1rem',
		lg: '1.2rem',
		xl: '1.5rem',
		xxl: '2rem'
	};

	const onClick = (e: MouseEvent) => {
		e.preventDefault();

		// emit the event
		dispatch('click');
	};
</script>

<button
	{...$$restProps}
	class={`liwe-button ${mode ? 'liwe3-scheme-' + mode : ''} ${
		variant ? 'liwe3-' + variant : ''
	} ${size} ${cssClass}`}
	class:liwe-button-custom={parentVars}
	on:click={onClick}
>
	{#if icon}
		<div class="liwe-button-icon-left">
			<Icon src={icon} size={iconSizes[size]} {solid} />
		</div>
	{/if}
	<slot>
		<div class="button-no-content" />
	</slot>
	{#if iconRight}
		<div class="liwe-button-icon-right">
			<Icon src={iconRight} size={iconSizes[size]} {solid} />
		</div>
	{/if}
</button>

<style>
	.liwe-button {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		--unit-w-size: 15rem;
	}
	/* parent custom properties */
	.liwe-button-custom {
		border-width: var(--liwe-button-custom-borderwidth, --liwe-border-width);
		border-style: var(--liwe-button-custom-borderstyle, --liwe-border-style);
		border-radius: var(--liwe-button-custom-borderradius, --liwe-border-radius);
		padding-top: var(--liwe-button-custom-padding-y, --liwe-button-padding-y) !important;
		padding-bottom: var(--liwe-button-custom-padding-y, --liwe-button-padding-y) !important;
		padding-left: var(--liwe-button-custom-padding-x, --liwe-button-padding-x) !important;
		padding-right: var(--liwe-button-custom-padding-x, --liwe-button-padding-x) !important;
		margin-top: var(--liwe-button-custom-margin-y, 0) !important;
		margin-bottom: var(--liwe-button-custom-margin-y, 0) !important;
		margin-left: var(--liwe-button-custom-margin-x, 0) !important;
		margin-right: var(--liwe-button-custom-margin-x, 0) !important;
	}

	.liwe-button-icon-left {
		flex: 0.1 0 10%;
		margin-right: 0.5em;
		padding-top: 0.2em;
	}
	.liwe-button-icon-right {
		flex: 0.1 0 10%;
		margin-left: 0.5em;
		padding-top: 0.2em;
	}
	.button-no-content {
		flex: 0;
		margin-right: -0.5em;
	}
	.xxs {
		padding: 0.12em 0.2em;
		font-size: 0.6rem;
		/* min-width: calc(var(--unit-w-size) / 3.5); */
	}
	.xs {
		padding: 0.12em 0.25em;
		font-size: 0.8rem;
		/* min-width: calc(var(--unit-w-size) / 3); */
	}

	.sm {
		padding: 0.25em 0.5em;
		font-size: 0.8rem;
		/* min-width: calc(var(--unit-w-size) / 2.5); */
	}

	.md {
		padding: 0.4em 0.5em;
		font-size: 1rem;
		/* min-width: calc(var(--unit-w-size) / 2); */
	}

	.lg {
		padding: 0.2em 0.5em;
		font-size: 1.2rem;
		/* min-width: calc(var(--unit-w-size) / 1.8); */
	}

	.xl {
		padding: 0.2em 0.5em;
		font-size: 1.5rem;
		/* min-width: calc(var(--unit-w-size) / 1.5); */
	}

	.xxl {
		padding: 0.2em 0.5em;
		font-size: 2rem;
		/* min-width: var(--unit-w-size); */
	}
</style>
