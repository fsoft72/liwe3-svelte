<script lang="ts">
	import ElementList from '$liwe3/components/ElementList.svelte';
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

<div class="title">{field?.label ?? ''}</div>
<ElementList
	name={field.name}
	value={_v(field)}
	{...field?.extra ?? {}}
	onchange={(e: any) => onchange(field.name, e.detail)}
/>
