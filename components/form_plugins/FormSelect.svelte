<script lang="ts">
	import Select from 'svelte-select';
	import type { FormField } from '../FormCreator.svelte';

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
</script>

<div class="custom-select">
	{#if field?.label ?? ''}
		<div class="label">{field?.label ?? ''}</div>
	{/if}
	<div class="svelte-select mode3" style="width: 100%">
		<Select
			{name}
			value={_v(field)}
			placeholder={field.placeholder}
			{...field?.extra ?? {}}
			{...props}
			on:change={(e: any) => {
				let vl:any[] | any;
				if (props?.multiple) {
					vl = Object.values(e.detail as Record<number, {label:string, value:any}>).map( (v:{label:string, value:any}) => v.value );
				} else {
					vl = e.detail.value;
				}
				onchange(name, vl, field)
			}}
			on:clear={() => onchange(name, '', field)}
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
