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

<div class="simple-row">
	<label for={field.name}>
		<Input
			type="checkbox"
			name={field.name}
			checked={isTrue(_v(field))}
			value="on"
			{...field?.extra ?? {}}
			onchange={(e: any) => onchange(field.name, e)}
		/>
		{field?.label ?? ''}
	</label>
</div>

<style>
	.simple-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
