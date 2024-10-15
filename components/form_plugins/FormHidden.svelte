<script lang="ts">
	import type { FormField } from '../FormCreator.svelte';

	interface Props {
		field: FormField;

		name: string;

		// dependency injection
		_v: (field: FormField) => any;

		// events
		onchange: (name: string, value: any) => void;

		// extra
		[key: string]: any;
	}

	let { field, name, onchange, _v, ...props }: Props = $props();
</script>

<input {...props} type="hidden" {name} value={_v(field)} />
