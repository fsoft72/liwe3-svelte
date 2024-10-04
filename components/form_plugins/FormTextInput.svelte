<script lang="ts">
	import Input from '$liwe3/components/Input.svelte';
	import type { FormField } from '../FormCreator.svelte';

	interface Props {
		field: FormField;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any) => void;

		// extra
		[key: string]: any;
	}

	let { onchange, _v, field, ...rest }: Props = $props();
</script>

<Input
	id={field.id}
	name={field.name}
	value={_v(rest as any)}
	type="text"
	label={field.label}
	{...rest}
	onchange={(e: any) => onchange(field.name, e)}
/>
