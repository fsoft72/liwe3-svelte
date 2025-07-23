<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';
	import { mkid } from '$liwe3/utils/utils';

	interface Props {
		id?: string;
		name?: string;
		checked?: boolean;
		value?: string | number | boolean;

		divClass?: string;
		label?: string;
		mode?: Color;
		size?: Size;

		// events
		onblur?: (event: FocusEvent) => void;
		onchange?: (event: Event) => void;

		// rest
		[k: string]: any;
	}

	let {
		id = mkid('id'),
		name = mkid('fld'),
		label = '',
		size = 'md',
		mode = 'mode3',
		divClass = '',
		value = '',
		checked = $bindable(),
		onblur,
		onchange,
		...rest
	}: Props = $props();

	const inputClass = `liwe3-form liwe3-form-custom-input ${rest.class ? rest.class : ''} ${mode} input checkbox ${size}`;
</script>

<div class={`${divClass} input-container checkbox ${size}`} style={`width:auto;`}>
	{#if label}
		<label for={id} class="label">{label}</label>
	{/if}
	<input
		{id}
		{name}
		{...rest}
		class={inputClass}
		type="checkbox"
		{value}
		bind:checked
		{onblur}
		{onchange}
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
		align-items: center;
		justify-content: flex-end;
		gap: 0.2rem;
	}

	.label {
		white-space: nowrap;
		/* font-size: 0.6rem; */
		margin: var(--liwe3-input-w-unit) 0;
		user-select: none;
	}

	/* Label size variants */
	.checkbox.xxs .label {
		font-size: 0.75rem;
	}

	.checkbox.xs .label {
		font-size: 0.75rem;
	}

	.checkbox.sm .label {
		font-size: 0.875rem;
	}

	.checkbox.md .label {
		font-size: 1rem;
	}

	.checkbox.lg .label {
		font-size: 1.12rem;
	}

	.checkbox.xl .label {
		font-size: 1.25rem;
	}

	.checkbox.xxl .label {
		font-size: 1.5rem;
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

	/* Checkbox size variants */
	input[type='checkbox'].xxs {
		width: 1rem;
		height: 1rem;
		min-width: 1rem;
		min-height: 1rem;
	}

	input[type='checkbox'].xs {
		width: 1.2rem;
		height: 1.2rem;
		min-width: 1.2rem;
		min-height: 1.2rem;
	}

	input[type='checkbox'].sm {
		width: 1.5rem;
		height: 1.5rem;
		min-width: 1.5rem;
		min-height: 1.5rem;
	}

	input[type='checkbox'].md {
		width: 2rem;
		height: 2rem;
		min-width: 2rem;
		min-height: 2rem;
	}

	input[type='checkbox'].lg {
		width: 2.5rem;
		height: 2.5rem;
		min-width: 2.5rem;
		min-height: 2.5rem;
	}

	input[type='checkbox'].xl {
		width: 3rem;
		height: 3rem;
		min-width: 3rem;
		min-height: 3rem;
	}

	input[type='checkbox'].xxl {
		width: 3.5rem;
		height: 3.5rem;
		min-width: 3.5rem;
		min-height: 3.5rem;
	}
	input[type='checkbox'] {
		background: var(--liwe3-form-bg);
		border: 2px solid #ccc;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		position: relative;
		cursor: pointer;
	}

	input[type='checkbox']:checked {
		color: white;
		background: var(--liwe3-accent-color);
	}

	input[type='checkbox']:checked::after {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-weight: bold;
	}

	/* Checkmark size variants */
	input[type='checkbox'].xxs:checked::after {
		font-size: 0.6rem;
	}

	input[type='checkbox'].xs:checked::after {
		font-size: 0.7rem;
	}

	input[type='checkbox'].sm:checked::after {
		font-size: 0.9rem;
	}

	input[type='checkbox'].md:checked::after {
		font-size: 1.2rem;
	}

	input[type='checkbox'].lg:checked::after {
		font-size: 1.5rem;
	}

	input[type='checkbox'].xl:checked::after {
		font-size: 1.8rem;
	}

	input[type='checkbox'].xxl:checked::after {
		font-size: 2.1rem;
	}
	/* end generic size rules for inputs and labels--------------------------*/
</style>
