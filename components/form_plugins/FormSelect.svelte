<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';
	import Select from 'svelte-select';

	interface Props {
		field: FormField;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any) => void;

		// extra
		[key: string]: any;
	}

	let { field, onchange, _v, ...props }: Props = $props();
</script>

<div class="custom-select">
	{#if field?.label ?? ''}
		<div class="label">{field?.label ?? ''}</div>
	{/if}
	<div class="svelte-select mode3" style="width: 100%">
		<Select
			name={field.name}
			value={_v(field)}
			placeholder={field.placeholder}
			{...field?.extra ?? {}}
			{...props}
			on:change={(e: any) => onchange(field.name, e.detail.value)}
			on:clear={() => onchange(field.name, '')}
			items={field.options ?? []}
		/>
	</div>
</div>

<style>
	.custom-select {
		position: relative;
		width: 100%;
		top: -4px;
	}
</style>
