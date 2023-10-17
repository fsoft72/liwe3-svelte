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
	class={`liwe-button ${mode} ${variant ? 'liwe3-' + variant : ''} ${size} ${cssClass}`}
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

	button.mode1,
	button.mode2,
	button.mode3,
	button.mode4,
	button.info,
	button.error,
	button.warning,
	button.success {
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	button.mode1:disabled,
	button.mode2:disabled,
	button.mode3:disabled,
	button.mode4:disabled,
	button.info:disabled,
	button.error:disabled,
	button.warning:disabled,
	button.success:disabled {
		cursor: not-allowed;
		transition: all 0.2s ease-in-out;
	}

	button.mode1 {
		background-color: var(--liwe3-mode1-700);
		border: 1px solid var(--liwe3-mode1-700-border);
		color: var(--liwe3-mode1-700-text);
	}

	button.mode1:disabled {
		background-color: var(--liwe3-mode1-700-disabled);
		color: var(--liwe3-mode1-700-disabled-text);
	}

	button.mode1:hover:not(:disabled) {
		background-color: var(--liwe3-mode1-700-hover);
	}

	button.mode1:active {
		background-color: var(--liwe3-mode1-700-clicked);
	}

	button.mode2 {
		background-color: var(--liwe3-mode2-700);
		border: 1px solid var(--liwe3-mode2-700-border);
		color: var(--liwe3-mode2-700-text);
	}

	button.mode2:disabled {
		background-color: var(--liwe3-mode2-700-disabled);
		color: var(--liwe3-mode2-700-disabled-text);
	}

	button.mode2:hover:not(:disabled) {
		background-color: var(--liwe3-mode2-700-hover);
	}

	button.mode2:active {
		background-color: var(--liwe3-mode2-700-clicked);
	}

	button.mode3 {
		background-color: var(--liwe3-mode3-700);
		border: 1px solid var(--liwe3-mode3-700-border);
		color: var(--liwe3-mode3-700-text);
	}

	button.mode3:disabled {
		background-color: var(--liwe3-mode3-700-disabled);
		color: var(--liwe3-mode3-700-disabled-text);
	}

	button.mode3:hover:not(:disabled) {
		background-color: var(--liwe3-mode3-700-hover);
	}

	button.mode3:active {
		background-color: var(--liwe3-mode3-700-clicked);
	}

	button.mode4 {
		background-color: var(--liwe3-mode4-700);
		border: 1px solid var(--liwe3-mode4-700-border);
		color: var(--liwe3-mode4-700-text);
	}

	button.mode4:disabled {
		background-color: var(--liwe3-mode4-700-disabled);
		color: var(--liwe3-mode4-700-disabled-text);
	}

	button.mode4:hover:not(:disabled) {
		background-color: var(--liwe3-mode4-700-hover);
	}

	button.mode4:active {
		background-color: var(--liwe3-mode4-700-clicked);
	}

	button.info {
		background-color: var(--liwe3-info-700);
		border: 1px solid var(--liwe3-info-700-border);
		color: var(--liwe3-info-700-text);
	}

	button.info:disabled {
		background-color: var(--liwe3-info-700-disabled);
		color: var(--liwe3-info-700-disabled-text);
	}

	button.info:hover:not(:disabled) {
		background-color: var(--liwe3-info-700-hover);
	}

	button.info:active {
		background-color: var(--liwe3-info-700-clicked);
	}

	button.error {
		background-color: var(--liwe3-error-700);
		border: 1px solid var(--liwe3-error-700-border);
		color: var(--liwe3-error-700-text);
	}

	button.error:disabled {
		background-color: var(--liwe3-error-700-disabled);
		color: var(--liwe3-error-700-disabled-text);
	}

	button.error:hover:not(:disabled) {
		background-color: var(--liwe3-error-700-hover);
	}

	button.error:active {
		background-color: var(--liwe3-error-700-clicked);
	}

	button.warning {
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
</style>
