<script lang="ts">
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

	let { field, onchange, _v, ...props }: Props = $props();
</script>

<input {...props} type="hidden" name={field.name} value={_v(field)} />
