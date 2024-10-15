<script lang="ts">
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

<div class="title">{field?.label ?? ''}</div>
<textarea
	style="width: 100%;"
	rows={10}
	cols={40}
	{...field}
	{...field?.extra ?? {}}
	{...props}
	{name}
	value={_v(field)}
	onchange={(e: any) => onchange(name, e, field)}
></textarea>
