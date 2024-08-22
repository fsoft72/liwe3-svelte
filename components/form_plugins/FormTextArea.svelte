<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';

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

<div class="title">{field?.label ?? ''}</div>
<textarea
	style="width: 100%;"
	rows={10}
	cols={40}
	{...field}
	{...field?.extra ?? {}}
	{...props}
	name={field.name}
	value={_v(field)}
	onchange={(e: any) => onchange(field.name, e)}
></textarea>
