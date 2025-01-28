<script lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import FormCreator from '$liwe3/components/FormCreator.svelte';
	import type { FormField } from '$liwe3/components/FormCreator.svelte';
	import { onMount } from 'svelte';

	interface Props {
		field: FormField;

		name: string;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any, field: FormField) => void;

		// extra
		[key: string]: any;
	}

	let { field, name, onchange, _v, ...props }: Props = $props();
	let isReady = $state(false);
	let fields: FormField[] = $state([]);
	let values: Record<string, any> = $state({});

	const groupFieldChange = (name: string, value: any) => {
		// onchange(name, value, field);
		values[name] = value;

		const myValues: Record<string, any> = {};
		fields.map((f: FormField) => {
			myValues[f.name.split('!')[1]] = values[f.name];
		});

		onchange(field.name, myValues, field);
	};

	onMount(() => {
		const allVals = _v(field);

		(field.extra?.fields as FormField[]).map((f) => {
			fields.push({
				...f,
				name: field.name + '!' + f.name
			});
			values[field.name + '!' + f.name] = allVals[f.name];
		});

		console.log('=== V: ', _v(field));

		isReady = true;
	});
</script>

<div class="frm-group">
	<span class="label">{field.label}</span>
	{#if isReady}
		<FormCreator {fields} {values} showButtons={false} onchange={groupFieldChange} />
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
