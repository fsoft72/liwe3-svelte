<script lang="ts">
	import type { Color, Size, Variant } from '$liwe3/types/types';
	import { Icon } from 'svelte-hero-icons';
	import type { IconSource } from 'svelte-hero-icons';

	interface _props {
		size?: Size;
		cssClass?: string;
		mode?: Color;
		variant?: Variant;
		icon?: IconSource;
		iconRight?: IconSource;
		solid?: boolean;
		disabled?: boolean | number;

		// events
		onclick?: (e: MouseEvent) => void;

		// children
		children?: any;

		// restProps
		[key: string]: any; // for restProps
	}

	let {
		size = 'md',
		cssClass = '',
		mode = 'mode1',
		variant = 'solid',
		disabled = false,
		icon = null,
		iconRight = null,
		solid = true,
		onclick,
		children,
		...restProps
	}: _props = $props();

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
		onclick && onclick(e);
	};
</script>

<button
	{...restProps}
	class={`liwe3-button ${mode} ${variant ? 'liwe3-' + variant : ''} ${size} ${cssClass}`}
	onclick={onClick}
>
	{#if icon}
		<div class="liwe3-button-icon-left">
			<Icon src={icon} size={iconSizes[size]} {solid} />
		</div>
	{/if}
	{@render children()}
	<div class="button-no-content"></div>
	{#if iconRight}
		<div class="liwe3-button-icon-right">
			<Icon src={iconRight} size={iconSizes[size]} {solid} />
		</div>
	{/if}
</button>

<style>
	.liwe3-button {
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		--unit-w-size: 15rem;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		color: var(--liwe3-button-color);
	}

	.liwe3-button:disabled {
		cursor: not-allowed;
		transition: all 0.2s ease-in-out;
	}

	.liwe3-button-icon-left {
		flex: 0.1 0 10%;
		margin-right: 0.5em;
		padding-top: 0.2em;
	}
	.liwe3-button-icon-right {
		flex: 0.1 0 10%;
		margin-left: 0.5em;
		padding-top: 0.2em;
	}
	.button-no-content {
		flex: 0;
		/* margin-right: -0.5em; */
	}

	.liwe3-button.liwe3-link {
		background-color: transparent !important;
		border: none !important;
		color: var(--liwe3-button-background) !important;
	}

	.liwe3-button.liwe3-link:hover:not(:disabled) {
		background-color: transparent !important;
		text-decoration: underline !important;
	}

	.liwe3-button.liwe3-outline:not(:hover) {
		background-color: transparent !important;
		color: var(--liwe3-button-background) !important;
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
		padding: var(--liwe3-button-padding-y, 0.35em) var(--liwe3-button-padding-x, 0.5em);
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
