<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';
	import { mkid } from '$liwe3/utils/utils';

	interface Props {
		id?: string;
		name?: string;
		value?: string;

		divClass?: string;
		label?: string;
		mode?: Color;
		size?: Size;
		type?: string;
		validChars?: string;
		width?: string;

		// events
		onblur?: (event: FocusEvent) => void;
		onchange?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onkeyup?: (event: KeyboardEvent) => void;

		// rest
		[k: string]: any;
	}

	let {
		name = mkid('fld'),
		label = '',
		id = mkid('id'),
		size = 'md',
		validChars = '',
		width = '100%',
		mode = 'mode3',
		divClass = '',
		value = $bindable(''),
		type = 'text',
		onblur,
		onchange,
		onkeydown,
		onkeyup,
		...rest
	}: Props = $props();

	const inputClass = `liwe3-form liwe3-form-custom-input ${rest.class ? rest.class : ''} ${mode} input ${size}`;

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

			_dispatchEvent(event, el.value);
			value = el.value;
		}
	};
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
		{name}
		class={inputClass}
		{type}
		{value}
		{onblur}
		{onchange}
		{onkeydown}
		{onkeyup}
		oninput={handleInput}
		title={rest.title || rest.placeholder || label || ''}
		{...rest}
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
		background: var(--liwe3-form-bg);
	}
	/* end generic size rules for inputs and labels--------------------------*/
</style>
