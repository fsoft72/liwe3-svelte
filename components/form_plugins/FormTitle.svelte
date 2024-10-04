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

	let { field, _v, onchange, ...props }: Props = $props();
</script>

<div class="title">{field?.label ?? ''}</div>
