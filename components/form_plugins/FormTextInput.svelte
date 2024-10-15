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

	let { onchange, name, _v, field, ...rest }: Props = $props();
</script>

<Input
	id={field.id}
	{name}
	value={_v(rest as any)}
	type="text"
	label={field.label}
	{...rest}
	onchange={(e: any) => onchange(name, e, field)}
/>
