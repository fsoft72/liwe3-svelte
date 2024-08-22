<script lang="ts">
	import type { FormField } from '$lib/FormCreator2.svelte';
	import Input from '$liwe3/components/Input.svelte';

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
