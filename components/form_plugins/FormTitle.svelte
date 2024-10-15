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

	let { field, name, _v, onchange, ...props }: Props = $props();
</script>

<div class="title">{field?.label ?? ''}</div>
