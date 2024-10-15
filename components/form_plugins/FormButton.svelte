<script lang="ts">
	import Button from '$liwe3/components/Button.svelte';
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

<Button {...field} {...field?.extra ?? {}} {name} onclick={field?.onclick}>
	{field.label}
</Button>
