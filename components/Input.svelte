<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { InputVariant, Size } from '$liwe3/types/types';

	export let label = '';
	export let id = ($$restProps.name ?? Math.random().toString()) + new Date().getTime().toString();
	export let size: Size = 'md';
	export let value: string | number | boolean = '';
	export let variant: InputVariant = 'plain';
	export let validChars: string = '';
	export let width: string = '100%';

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
	$: if (type == 'checkbox') variant = 'none';
</script>

<div class={`input-${variant}`} class:checkbox={type === 'checkbox'} style={`width: ${width}`}>
	<input
		class:filled={value}
		{id}
		{...$$restProps}
		class={`input ${size} i-${type}`}
		on:blur
		on:change
		on:keydown
		on:keyup
		on:keypress
		on:input={handleInput}
		bind:value
	/>
	{#if label}
		<label for={id} class="label">{label}</label>
	{/if}
	{#if variant === 'material'}
		<div class="underline" />
	{/if}
</div>

<style>
	/* generic input rules --------------------------*/
	input,
	input:active,
	input:focus {
		border: none;
		border-color: transparent;
		outline: none;
	}
	input {
		--input-w-unit: 0.5rem;
	}
	.input {
		color: var(--liwe-main-color);
		border-radius: var(--liwe-border-radius);
	}

	.label {
		white-space: nowrap;
	}
	.input-plain,
	.input-none {
		display: flex;
		flex-direction: column-reverse;
		align-items: flex-start;
		width: 100%;
	}

	.input-none.checkbox {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		max-width: max-content;
		min-height: 0.875rem;
		max-height: 1.5rem;
	}
	/* end generic input rules --------------------------*/
	/* input plain rules --------------------------*/
	.input-plain .input {
		background-color: var(--liwe-main-bg-color);
		border: 1px solid var(--liwe-border-color);
		width: 100%;
	}
	/* end input plain rules --------------------------*/
	/* input boxed rules --------------------------*/
	.input-boxed {
		position: relative;
	}

	.input-boxed .input {
		position: relative;
		width: 100%;
		background: var(--liwe-main-bg-color);
		border: solid 1.5px var(--liwe-darker-primary-color);
		border-radius: var(--liwe-border-radius);
		color: var(--liwe-main-color);
	}

	.input-boxed .label {
		position: absolute;
		pointer-events: none;
		left: 0.5rem;
		top: 0.4rem;
		padding: 0 0.3rem;
		white-space: nowrap;
		overflow: hidden;
		line-height: 1rem;
		color: var(--liwe-darker-secondary-color);
		background-color: transparent;
		transition: 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.input-boxed .input.filled ~ .label,
	.input-boxed .input:focus ~ .label {
		top: -0.5rem;
		left: 0.7rem;
		font-size: 0.675rem;
		background-color: var(--liwe-main-bg-color);
		color: var(--liwe-primary-color);
	}

	.input-boxed .input.filled:not(:focus) ~ .label {
		color: var(--liwe-primary-color);
	}
	/* end input boxed rules --------------------------*/
	/* input material rules --------------------------*/
	.input-material {
		position: relative;
		margin: 2rem auto;
		width: fit-content;
	}

	.input-material .input {
		border: none;
		border-bottom: 2px solid var(--liwe-darker-secondary-color);
		padding: 5px 0;
		background-color: transparent;
		outline: none;
	}

	.input-material .label {
		position: absolute;
		top: 0;
		left: 0;
		color: var(--liwe-darker-secondary-color);
		transition: all 0.3s ease;
		pointer-events: none;
	}

	.input-material .input.filled ~ .label,
	.input-material .input:focus ~ .label {
		top: -20px;
		font-size: 16px;
		color: var(--liwe-dark-color);
	}

	.input-material .underline {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		min-width: 100%;
		background-color: var(--liwe-main-color);
		transform: scaleX(0);
		transition: all 0.3s ease;
	}

	.input-material input:focus ~ .underline,
	.input-material .input.filled ~ .underline {
		transform: scaleX(1);
	}
	/* end input material rules --------------------------*/
	/* generic size rules for inputs and labels--------------------------*/
	.input.xxs ~ .label,
	.xxs {
		padding: 0.12rem 0.2rem;
		font-size: 0.75rem;
		min-width: calc(var(--input-w-unit) * 4);
	}

	.input.xs ~ .label,
	.xs {
		padding: 0.15rem 0.22rem;
		font-size: 0.75rem;
		min-width: calc(var(--input-w-unit) * 5);
	}

	.input.sm ~ .label,
	.sm {
		padding: 0.18rem 0.24rem;
		font-size: 0.875rem;
		min-width: calc(var(--input-w-unit) * 6);
	}

	.input.md ~ .label,
	.md {
		padding: 0.2rem 0.26rem;
		font-size: 1rem;
		min-width: calc(var(--input-w-unit) * 7);
	}

	.input.lg ~ .label,
	.lg {
		padding: 0.22rem 0.28rem;
		font-size: 1.12rem;
		min-width: calc(var(--input-w-unit) * 8);
	}

	.input.xl ~ .label,
	.xl {
		padding: 0.24rem 0.4rem;
		font-size: 1.25rem;
		min-width: calc(var(--input-w-unit) * 9);
	}

	.input.xxl ~ .label,
	.xxl {
		padding: 0.28rem 0.45rem;
		font-size: 1.5rem;
		min-width: calc(var(--input-w-unit) * 10);
	}
	/* end generic size rules for inputs and labels--------------------------*/
	/* input boxed labels rules --------------------------*/
	/* blurred */
	.input-boxed .input.xxs ~ .label,
	.input-boxed .input.xs ~ .label,
	.input-boxed .input.sm ~ .label {
		padding: 0 0.2rem;
		margin-top: -0.2rem;
	}
	.input-boxed .input.md ~ .label,
	.input-boxed .input.lg ~ .label {
		padding: 0 0.25rem;
	}
	/* focus/filled */
	.input-boxed .input.xxs.filled ~ .label,
	.input-boxed .input.xxs:focus ~ .label,
	.input-boxed .input.xs.filled ~ .label,
	.input-boxed .input.xs:focus ~ .label {
		padding: 0 0.2rem;
		margin-top: -0.2rem;
		font-size: 0.75rem;
	}
	.input-boxed .input.sm.filled ~ .label,
	.input-boxed .input.sm:focus ~ .label {
		padding: 0 0.2rem;
		margin-top: -0.4rem;
		font-size: 0.875rem;
	}
	.input-boxed .input.md.filled ~ .label,
	.input-boxed .input.md:focus ~ .label,
	.input-boxed .input.lg.filled ~ .label,
	.input-boxed .input.lg:focus ~ .label {
		padding: 0 0.4rem;
		margin-top: -0.25rem;
		font-size: 1rem;
	}
	.input-boxed .input.xl.filled ~ .label,
	.input-boxed .input.xl:focus ~ .label,
	.input-boxed .input.xxl.filled ~ .label,
	.input-boxed .input.xxl:focus ~ .label {
		margin-top: -0.25rem;
		padding: 0 0.25rem;
		font-size: 1rem;
	}
	/* end input boxed labels rules --------------------------*/

	/* input type number settings 👇 --------------------------*/
	.i-number {
		text-align: right;
	}

	/* checkbox settings 👇 --------------------------*/
	.i-checkbox {
		--primary-color: var(--liwe-primary-color);
		--secondary-color: var(--liwe-secondary-color);
		--primary-hover-color: var(--liwe-comp-primary-color);
		/* checkbox */
		--checkbox-diameter: 20px;
		--checkbox-border-radius: 5px;
		--checkbox-border-color: var(--liwe-darker-secondary-color);
		--checkbox-border-width: 1px;
		--checkbox-border-style: solid;
		/* checkmark */
		--checkmark-size: 1.4;
	}

	.input.i-checkbox.xxs {
		width: var(--checkbox-diameter) !important;
		height: var(--checkbox-diameter) !important;
		max-width: var(--checkbox-diameter) !important;
		max-height: var(--checkbox-diameter) !important;
	}

	.i-checkbox,
	.i-checkbox *,
	.i-checkbox *::before,
	.i-checkbox *::after {
		box-sizing: border-box;
	}

	.i-checkbox {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		width: var(--checkbox-diameter) !important;
		height: var(--checkbox-diameter) !important;
		max-width: var(--checkbox-diameter) !important;
		max-height: var(--checkbox-diameter) !important;
		border-radius: var(--checkbox-border-radius);
		background: var(--secondary-color);
		border: var(--checkbox-border-width) var(--checkbox-border-style) var(--checkbox-border-color);
		transition: all 0.3s;
		cursor: pointer;
		position: relative;
		display: inline-block;
	}

	/* reset input width and height --------------------------*/
	.input.i-checkbox.xxs,
	.input.i-checkbox.xs,
	.input.i-checkbox.xs,
	.input.i-checkbox.sm,
	.input.i-checkbox.md,
	.input.i-checkbox.lg,
	.input.i-checkbox.xl,
	.input.i-checkbox.xxl {
		min-width: var(--checkbox-diameter) !important;
		min-height: var(--checkbox-diameter) !important;
	}

	.i-checkbox::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		box-shadow: 0 0 0 calc(var(--checkbox-diameter) / 2.5) var(--primary-color);
		border-radius: inherit;
		opacity: 0;
		transition: all 0.5s cubic-bezier(0.12, 0.4, 0.29, 1.46);
	}

	.i-checkbox::before {
		top: 40%;
		left: 50%;
		content: '';
		position: absolute;
		width: 4px;
		height: 7px;
		border-right: 2px solid var(--secondary-color);
		border-bottom: 2px solid var(--secondary-color);
		transform: translate(-50%, -50%) rotate(45deg) scale(0);
		opacity: 0;
		transition: all 0.1s cubic-bezier(0.71, -0.46, 0.88, 0.6), opacity 0.1s;
	}

	.i-checkbox ~ .label {
		margin: 0;
		padding: 0;
	}
	/* actions --------------------------*/

	.i-checkbox:hover {
		border-color: var(--primary-color);
	}

	.i-checkbox:checked {
		background: var(--primary-color);
		border-color: transparent;
	}

	.i-checkbox:checked::before {
		opacity: 1;
		transform: translate(-50%, -50%) rotate(45deg) scale(var(--checkmark-size));
		transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
	}

	.i-checkbox:active:not(:checked)::after {
		box-shadow: none;
		transition: none;
		opacity: 1;
	}
</style>
