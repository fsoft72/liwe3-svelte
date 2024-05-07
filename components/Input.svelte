<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';

	export let label = '';
	export let id = ($$restProps.name ?? Math.random().toString()) + new Date().getTime().toString();
	export let size: Size = 'md';
	export let validChars: string = '';
	export let width: string = 'auto';
	export let mode: Color = 'mode3';
	export let divClass: string = '';
	export let value: string | boolean | number = '';

	const inputClass = `liwe3-form liwe3-form-custom-input ${$$restProps.class ? $$restProps.class : ''} ${mode} input ${size}`;
	const checkboxClass = `${mode} liwe3-form liwe3-form-custom-checkbox-radio ${$$restProps.class ? $$restProps.class : ''} checkbox ${size}`;

	let type = 'checkbox';
	let rx = validChars ? new RegExp(`[^${validChars}]*`, 'g') : null;

	let isDispatching = false;

	const _dispatchEvent = (event: Event, data: string) => {
		if (!event || !event.target) return;

		// dispatch standard 'input' event with the new filteredValue
		const inputEvent = new InputEvent('input', {
			bubbles: true,
			cancelable: true,
			composed: true,
			data
		});
		isDispatching = true;
		event.target.dispatchEvent(inputEvent);
		isDispatching = false;
	};

	const handleInput = (event: Event) => {
		if (isDispatching) return;
		if (!event || !event.target) return;
		event.stopImmediatePropagation();
		event.stopPropagation();

		if (rx) {
			const inputValue = (event.target as HTMLInputElement).value;
			const filteredValue: string = inputValue.replace(rx, '');

			if (filteredValue !== inputValue) {
				(event.target as HTMLInputElement).value = filteredValue;
				_dispatchEvent(event, filteredValue);
				value = filteredValue;
			}
		} else {
			const el = event.target as HTMLInputElement;

			if (el.type === 'checkbox') {
				el.value = el.checked ? 'true' : 'false';
			}

			_dispatchEvent(event, el.value);
			value = el.value;
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
		{value}
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
		padding-block: var(--liwe3-input-padding-y);
		padding-inline: var(--liwe3-input-padding-x);
	}
	.input {
		margin-right: var(--liwe3-input-w-unit);
		width: 100%;
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
		user-select: none;
	}
	/* generic size rules for inputs and labels--------------------------*/
	.xxs {
		padding: 0.12rem 0.2rem !important;
		font-size: 0.75rem;
		min-width: calc(var(--liwe3-input-w-unit) * 4);
	}

	.xs {
		padding: 0.15rem 0.22rem !important;
		font-size: 0.75rem;
		min-width: calc(var(--liwe3-input-w-unit) * 5);
	}

	.sm {
		padding: 0.18rem 0.24rem !important;
		font-size: 0.875rem;
		min-width: calc(var(--liwe3-input-w-unit) * 6);
	}

	.md {
		/* padding is the default value defined in css variables */
		font-size: 1rem;
		min-width: calc(var(--liwe3-input-w-unit) * 7);
	}

	.lg {
		padding: 0.22rem 0.28rem !important;
		font-size: 1.12rem;
		min-width: calc(var(--liwe3-input-w-unit) * 8);
	}

	.xl {
		padding: 0.24rem 0.4rem !important;
		font-size: 1.25rem;
		min-width: calc(var(--liwe3-input-w-unit) * 9);
	}

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
