<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Color, InputVariant, Size } from '$liwe3/types/types';

	export let label = '';
	export let id = ($$restProps.name ?? Math.random().toString()) + new Date().getTime().toString();
	export let size: Size = 'md';
	export let value: string | number | boolean = '';
	export let validChars: string = '';
	export let width: string = 'auto';
	export let mode: Color = 'mode3';
	export let divClass: string = '';

	const inputClass = `cform cform-custom-input ${$$restProps.class} ${mode} input ${size}`;
	const checkboxClass = `${mode} cform cform-custom-checkbox-radio ${$$restProps.class} checkbox ${size}`;

	let type = 'checkbox';
	let rx = validChars ? new RegExp(`[^${validChars}]*`, 'g') : null;

	const dispatch = createEventDispatcher();

	const _dispatchEvent = (event: Event, data: string) => {
		if (!event || !event.target) return;

		// dispatch standard 'input' event with the new filteredValue
		const inputEvent = new InputEvent('input', {
			bubbles: true,
			cancelable: true,
			composed: true,
			data
		});
		event.target.dispatchEvent(inputEvent);
	};

	const handleInput = (event: Event) => {
		if (!event || !event.target) return;

		if (rx) {
			event.stopImmediatePropagation();

			const inputValue = (event.target as HTMLInputElement).value;
			const filteredValue: string = inputValue.replace(rx, '');

			if (filteredValue !== inputValue) {
				(event.target as HTMLInputElement).value = filteredValue;
				// dispatch standard 'input' event with the new filteredValue
				_dispatchEvent(event, filteredValue);
			}
		} else {
			const el = event.target as HTMLInputElement;

			if (el.type === 'checkbox') {
				el.value = el.checked ? 'true' : 'false';
			}

			dispatch('input', el);
		}
	};

	$: type = $$restProps.type || 'text';
</script>

<div
	class={`${divClass} input-container`}
	class:checkbox={type === 'checkbox'}
	style={`width: ${width}`}
>
	{#if label}
		<label for={id} class="label">{label}</label>
	{/if}
	<input
		{id}
		{...$$restProps}
		class={type === 'checkbox' ? checkboxClass : inputClass}
		{type}
		on:blur
		on:change
		on:keydown
		on:keyup
		on:keypress
		on:input={handleInput}
	/>
</div>

<style>
	/* generic input rules --------------------------*/
	:global(:root) {
		--liwe3-input-w-unit: 0.3rem;
	}
	.input-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;
		padding-top: var(--liwe3-form-padding-x);
		padding-bottom: var(--liwe3-form-padding-x);
		padding-left: var(--liwe3-form-padding-y);
		padding-right: var(--liwe3-form-padding-y);
	}
	.input {
		margin-right: var(--liwe3-input-w-unit);
	}
	.checkbox {
		/* width: 100%; */
		flex-direction: row-reverse;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 0.2rem;
	}

	.label {
		white-space: nowrap;
		font-size: 0.6rem;
		margin: var(--liwe3-input-w-unit) 0;
	}
	/* generic size rules for inputs and labels--------------------------*/
	.input.xxs ~ .label,
	.xxs {
		padding: 0.12rem 0.2rem !important;
		font-size: 0.75rem;
		min-width: calc(var(--liwe3-input-w-unit) * 4);
	}

	.input.xs ~ .label,
	.xs {
		padding: 0.15rem 0.22rem !important;
		font-size: 0.75rem;
		min-width: calc(var(--liwe3-input-w-unit) * 5);
	}

	.input.sm ~ .label,
	.sm {
		padding: 0.18rem 0.24rem !important;
		font-size: 0.875rem;
		min-width: calc(var(--liwe3-input-w-unit) * 6);
	}

	.input.md ~ .label,
	.md {
		/* padding is the default value defined in css variables */
		font-size: 1rem;
		min-width: calc(var(--liwe3-input-w-unit) * 7);
	}

	.input.lg ~ .label,
	.lg {
		padding: 0.22rem 0.28rem !important;
		font-size: 1.12rem;
		min-width: calc(var(--liwe3-input-w-unit) * 8);
	}

	.input.xl ~ .label,
	.xl {
		padding: 0.24rem 0.4rem !important;
		font-size: 1.25rem;
		min-width: calc(var(--liwe3-input-w-unit) * 9);
	}

	.input.xxl ~ .label,
	.xxl {
		padding: 0.28rem 0.45rem !important;
		font-size: 1.5rem;
		min-width: calc(var(--liwe3-input-w-unit) * 10);
	}
	input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		min-width: 1rem;
		min-height: 1rem;
	}
	/* end generic size rules for inputs and labels--------------------------*/
</style>
