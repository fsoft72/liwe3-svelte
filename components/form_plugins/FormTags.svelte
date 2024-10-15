<script lang="ts">
	import TagInput from '$liwe3/components/TagInput.svelte';
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

<TagInput
	{...props}
	{name}
	value={_v(field)}
	{...field?.extra ?? {}}
	onchange={(e: any) => onchange(name, e, field)}
/>
