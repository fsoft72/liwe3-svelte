<script lang="ts">
	import MarkdownInput from '$liwe3/components/MarkdownInput.svelte';
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
<MarkdownInput
	name={field.name}
	value={_v(field)}
	{...field?.extra ?? {}}
	onchange={(e: any) => onchange(field.name, e)}
/>
