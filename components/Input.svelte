<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';
	import { mkid } from '$liwe3/utils/utils';

	interface Props {
		id?: string;
		name?: string;
		value?: string | number | boolean; // Allow boolean for checkbox

		divClass?: string;
		label?: string;
		mode?: Color;
		size?: Size;
		type?: string;
		validChars?: string;
		width?: string;
		checked?: boolean; // For checkbox binding

		// events
		onblur?: (event: FocusEvent) => void;
		onchange?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onkeyup?: (event: KeyboardEvent) => void;
		oninput?: (event: Event) => void;
		onpaste?: (event: ClipboardEvent) => void; // Add onpaste

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
		value: valueProp = $bindable(''),
		type = 'text',
		checked = $bindable(false), // Bindable checked state for checkbox
		onblur,
		onchange,
		onkeydown, // User's onkeydown
		onkeyup,
		oninput, // User's oninput
		onpaste, // User's onpaste
		...rest
	}: Props = $props();

	// Use local state derived from props for binding, handling checkbox separately
	let value = $state(type === 'checkbox' ? checked : valueProp);
	$effect(() => {
		if (type === 'checkbox') {
			checked = Boolean(valueProp);
		} else {
			valueProp = value;
		}
	});

	// if (validChars) type = 'text'; // Force type to text if validChars is set

	const inputClass = `liwe3-form liwe3-form-custom-input ${rest.class ? rest.class : ''} ${mode} input ${size}`;

	const handleKeyDown = (event: KeyboardEvent) => {
		// Call user's onkeydown first
		if (onkeydown) {
			onkeydown(event);
			// If user prevented default, respect it
			if (event.defaultPrevented) {
				return;
			}
		}

		// Only apply logic if validChars is set (inputType will be 'text' in this case)
		if (!validChars) return;

		const key = event.key;
		const isCtrlCmd = event.ctrlKey || event.metaKey;

		// Allow navigation, control keys, and specific combinations
		if (
			[
				'Backspace',
				'Delete',
				'Tab',
				'Escape',
				'Enter',
				'Home',
				'End',
				'ArrowLeft',
				'ArrowRight',
				'ArrowUp',
				'ArrowDown',
				'Shift',
				'Control',
				'Alt',
				'Meta'
			].includes(key) ||
			(isCtrlCmd && ['a', 'c', 'v', 'x', 'z', 'y'].includes(key.toLowerCase()))
		) {
			return; // Allow the event
		}

		// Check if the key is a printable character
		if (key.length === 1) {
			// If the character is not in validChars, prevent it
			if (!validChars.includes(key)) {
				event.preventDefault();
			}
		}
		// Allow other keys (like F1-F12) by default
	};

	const handlePaste = (event: ClipboardEvent) => {
		// Call user's onpaste first
		if (onpaste) {
			onpaste(event);
			// If user prevented default, respect it
			if (event.defaultPrevented) {
				return;
			}
		}

		// Only apply logic if validChars is set (inputType will be 'text' in this case)
		if (!validChars) return;

		event.preventDefault(); // Prevent default paste

		const text = event.clipboardData?.getData('text/plain') || '';
		if (!text) return;

		const filteredText = text
			.split('')
			.filter((char) => validChars.includes(char))
			.join('');
		if (!filteredText) return; // Nothing valid to paste

		const inputElement = event.target as HTMLInputElement;
		const start = inputElement.selectionStart ?? 0;
		const end = inputElement.selectionEnd ?? 0;
		const originalValue = inputElement.value;

		// Construct the new value
		const newValue =
			originalValue.substring(0, start) + filteredText + originalValue.substring(end);

		// Update the input value directly and the bindable state
		inputElement.value = newValue;
		value = newValue; // Update bindable value

		// Manually set cursor position after paste
		const newCursorPos = start + filteredText.length;
		inputElement.selectionStart = inputElement.selectionEnd = newCursorPos;

		// Dispatch an 'input' event manually so Svelte bindings and user's oninput handler are triggered
		const inputEvent = new InputEvent('input', {
			bubbles: true,
			cancelable: false, // Typically false for programmatic changes
			composed: true,
			data: filteredText, // Optionally include the inserted data
			inputType: 'insertFromPaste' // Indicate the type of input
		});
		inputElement.dispatchEvent(inputEvent);
	};

	const handleInput = (event: Event) => {
		// Simplified: Update state based on DOM value after keydown/paste filtering
		const target = event.target as HTMLInputElement;
		if (type === 'checkbox') {
			value = target.checked;
		} else {
			value = target.value;
		}

		// Call user's oninput handler
		if (oninput) {
			oninput(event);
		}
	};
</script>

<div
	class={`${divClass} input-container`}
	class:checkbox={type === 'checkbox'}
	style={`width: ${width}`}
>
	{#if label && type !== 'checkbox'}
		<label for={id} class="label">{label}</label>
	{/if}
	<input
		{id}
		{name}
		class={inputClass}
		{value}
		{checked}
		{type}
		{onblur}
		{onchange}
		onkeydown={handleKeyDown}
		{onkeyup}
		oninput={handleInput}
		onpaste={handlePaste}
		title={rest.title || rest.placeholder || label || ''}
		{...rest}
	/>
	{#if label && type === 'checkbox'}
		<label for={id} class="label">{label}</label>
	{/if}
</div>

<style>
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
		flex-direction: row-reverse;
		align-items: center; /* Better alignment for checkbox and label */
		justify-content: flex-end;
		gap: 0.5rem; /* Increased gap */
		padding-block: 0; /* Remove vertical padding for checkbox container */
		padding-inline: 0; /* Remove horizontal padding for checkbox container */
	}

	.label {
		white-space: nowrap;
		font-size: 0.6rem;
		margin: var(--liwe3-input-w-unit) 0;
		user-select: none;
	}
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
		margin: 0; /* Remove default margins */
		vertical-align: middle; /* Align checkbox vertically */
	}
	.checkbox .label {
		margin: 0; /* Remove margins for checkbox label */
		font-size: 1rem; /* Match default font size or adjust as needed */
	}
</style>
