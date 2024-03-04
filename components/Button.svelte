<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { Color, Size, Variant } from '$liwe3/types/types';
	import { Icon } from 'svelte-hero-icons';
	import type { IconSource } from 'svelte-hero-icons';

	export let size: Size = 'md';
	export let cssClass: string = '';
	export let mode: Color = 'mode1';
	export let variant: Variant = 'solid';
	export let icon: IconSource | null = null;
	export let iconRight: IconSource | null = null;
	export let solid: boolean = true;

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
	class={`liwe3-button ${mode} ${variant ? 'liwe3-' + variant : ''} ${size} ${cssClass}`}
	on:click={onClick}
>
	{#if icon}
		<div class="liwe3-button-icon-left">
			<Icon src={icon} size={iconSizes[size]} {solid} />
		</div>
	{/if}
	<slot>
		<div class="button-no-content" />
	</slot>
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
		color: var(--liwe3-color);
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
		margin-right: -0.5em;
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
	/*
	.liwe-button.mode1 {
		background-color: var(--button-mode1-background);
		border: 1px solid var(--button-mode1-border);
		color: var(--button-mode1-text);
	}

	.liwe-button.mode1:disabled {
		background-color: var(--button-mode1-disabled);
		color: var(--button-mode1-disabled-text);
	}

	.liwe-button.mode1:hover:not(:disabled) {
		background-color: var(--button-mode1-hover);
	}

	.liwe-button.mode1:active {
		background-color: var(--button-mode1-active);
	}

	.liwe-button.mode2 {
		background-color: var(--button-mode2-background);
		border: 1px solid var(--button-mode2-border);
		color: var(--button-mode2-text);
	}

	.liwe-button.mode2:disabled {
		background-color: var(--button-mode2-disabled);
		color: var(--button-mode2-disabled-text);
	}

	.liwe-button.mode2:hover:not(:disabled) {
		background-color: var(--button-mode2-hover);
	}

	.liwe-button.mode2:active {
		background-color: var(--button-mode2-active);
	}

	.liwe-button.mode3 {
		background-color: var(--button-mode3-background);
		border: 1px solid var(--button-mode3-border);
		color: var(--button-mode3-text);
	}

	.liwe-button.mode3:disabled {
		background-color: var(--button-mode3-disabled);
		color: var(--button-mode3-disabled-text);
	}

	.liwe-button.mode3:hover:not(:disabled) {
		background-color: var(--button-mode3-hover);
	}

	.liwe-button.mode3:active {
		background-color: var(--button-mode3-active);
	}

	.liwe-button.mode4 {
		background-color: var(--button-mode4-background);
		border: 1px solid var(--button-mode4-border);
		color: var(--button-mode4-text);
	}

	.liwe-button.mode4:disabled {
		background-color: var(--button-mode4-disabled);
		color: var(--button-mode4-disabled-text);
	}

	.liwe-button.mode4:hover:not(:disabled) {
		background-color: var(--button-mode4-hover);
	}

	.liwe-button.mode4:active {
		background-color: var(--button-mode4-active);
	}

	.liwe-button.info {
		background-color: var(--liwe3-info-700);
		border: 1px solid var(--liwe3-info-700-border);
		color: var(--liwe3-info-700-text);
	}

	.liwe-button.info:disabled {
		background-color: var(--liwe3-info-700-disabled);
		color: var(--liwe3-info-700-disabled-text);
	}

	.liwe-button.info:hover:not(:disabled) {
		background-color: var(--liwe3-info-700-hover);
	}

	.liwe-button.info:active {
		background-color: var(--liwe3-info-700-clicked);
	}

	.liwe-button.error {
		background-color: var(--liwe3-error-700);
		border: 1px solid var(--liwe3-error-700-border);
		color: var(--liwe3-error-700-text);
	}

	.liwe-button.error:disabled {
		background-color: var(--liwe3-error-700-disabled);
		color: var(--liwe3-error-700-disabled-text);
	}

	.liwe-button.error:hover:not(:disabled) {
		background-color: var(--liwe3-error-700-hover);
	}

	.liwe-button.error:active {
		background-color: var(--liwe3-error-700-clicked);
	}

	.liwe-button.warning {
		background-color: var(--liwe3-warning-700);
		border: 1px solid var(--liwe3-warning-700-border);
		color: var(--liwe3-warning-700-text);
	}

	button.warning:disabled {
		background-color: var(--liwe3-warning-700-disabled);
		color: var(--liwe3-warning-700-disabled-text);
	}

	button.warning:hover:not(:disabled) {
		background-color: var(--liwe3-warning-700-hover);
	}

	button.warning:active {
		background-color: var(--liwe3-warning-700-clicked);
	}

	button.success {
		background-color: var(--liwe3-success-700);
		border: 1px solid var(--liwe3-success-700-border);
		color: var(--liwe3-success-700-text);
	}

	button.success:disabled {
		background-color: var(--liwe3-success-700-disabled);
		color: var(--liwe3-success-700-disabled-text);
	}

	button.success:hover:not(:disabled) {
		background-color: var(--liwe3-success-700-hover);
	}

	button.success:active {
		background-color: var(--liwe3-success-700-clicked);
	}
	*/
</style>
