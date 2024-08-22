<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';
	import Input from '$liwe3/components/Input.svelte';
	import { isTrue } from '$liwe3/utils/utils';

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
