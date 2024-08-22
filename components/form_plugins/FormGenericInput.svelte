<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';
	import Input from '$liwe3/components/Input.svelte';

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

<Input
	{...field}
	{...field?.extra ?? {}}
	{...props}
	name={field.name}
	value={_v(field)}
	type="text"
	onchange={(e: any) => onchange(field.name, e)}
/>
