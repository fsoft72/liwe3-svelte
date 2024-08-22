<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';
	import Button from '$liwe3/components/Button.svelte';

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

<Button {...field} {...field?.extra ?? {}} onclick={field?.onclick}>
	{field.label}
</Button>
