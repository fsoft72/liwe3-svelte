<script lang="ts">
	import DraggableTree from '$liwe3/components/DraggableTree.svelte';
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

<DraggableTree
	name={field.name}
	tree={_v(field)}
	{...field?.extra ?? {}}
	onchange={(e: any) => onchange(field.name, e)}
/>
