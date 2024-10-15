<script lang="ts">
	import Input from '$liwe3/components/Input.svelte';
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

<Input
	{...field}
	{...field?.extra ?? {}}
	{...props}
	{name}
	value={_v(field)}
	type="text"
	onchange={(e: any) => onchange(name, e, field)}
/>
