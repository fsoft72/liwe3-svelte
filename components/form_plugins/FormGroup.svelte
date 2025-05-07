<script module lang="ts">
	// Export validation function to be used by FormCreator plugin system
	export const validate = (field: FormField, values: Record<string, any>) => {
		const required: string[] = [];
		const groupFields = field.extra?.fields as FormField[];
		const groupValues = values[field.name] ?? {};

		console.log('=== GROUP: ', { groupFields, groupValues });

		if (!groupFields) return required;

		groupFields.forEach((subField) => {
			if (subField.required && !groupValues[subField.name]) {
				required.push(`${field.label} > ${subField.label ?? subField.name}`);
			}
		});

		return required;
	};
</script>

<script lang="ts">
	import FormCreator from '$liwe3/components/FormCreator.svelte';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import { onMount } from 'svelte';

	const SEP = '|';

	interface Props {
		field: FormField;

		name: string;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any, field: FormField) => void;
		onfieldsel?: (name: string, value: any) => void;

		// extra
		[key: string]: any;
	}

	let { field, name, onchange, onfieldsel, _v, ...props }: Props = $props();
	let isReady = $state(false);
	let fields: FormField[] = $state([]);
	let values: Record<string, any> = $state({});
	let form: FormCreator | null = $state(null);

	const groupFieldChange = (name: string, value: any) => {
		values[name] = value;

		const myValues: Record<string, any> = {};
		fields.map((f: FormField) => {
			const splits = f.name.split(SEP);
			// name is the last part of the name
			const name = splits[splits.length - 1];

			myValues[name] = values[f.name];
		});

		onchange(field.name, myValues, field);
	};

	onMount(() => {
		const allVals = _v(field);

		(field.extra?.fields as FormField[]).map((f) => {
			fields.push({
				...f,
				name: field.name + SEP + f.name
			});
			values[field.name + SEP + f.name] = allVals[f.name];
		});

		// console.log('=== V: ', _v(field));

		isReady = true;
	});
</script>

<div class="frm-group">
	<span class="label">{field.label}</span>
	{#if isReady}
		<FormCreator
			bind:this={form}
			{fields}
			{values}
			showButtons={false}
			onchange={groupFieldChange}
			{onfieldsel}
		/>
	{/if}
</div>

<style>
	.frm-group {
		margin: 10px;
		padding: 0.5rem;

		border: 1px solid #ccc;
		border-radius: var(--liwe3-border-radius);
	}
</style>
