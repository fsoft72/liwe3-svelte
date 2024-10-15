<script lang="ts">
	import Input from '$liwe3/components/Input.svelte';
	import { isTrue } from '$liwe3/utils/utils';
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

<div class="simple-row">
	<label for={name}>
		<Input
			type="checkbox"
			{name}
			checked={isTrue(_v(field))}
			value="on"
			{...field?.extra ?? {}}
			onchange={(e: any) => onchange(name, e, field)}
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
