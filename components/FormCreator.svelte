<script context="module" lang="ts">
	import type { IconSource } from 'svelte-hero-icons';

	export type FormField = {
		name: string;
		type?: string;
		label?: string;
		placeholder?: string;
		required?: boolean;
		size?: Size;
		col?: number; // number of column (1 - 12)
		autofocus?: boolean;
		validChars?: string;
		align?: 'flex-start' | 'flex-end' | 'center';
		icon?: IconSource;
		extra?: Record<string, unknown>;
		options?: { label: string; value: string }[];

		// events
		onChange?: (name: string, value: any, values: Record<string, any>) => Promise<boolean>;
	};

	type FormCreatorPlugin = {
		name: string;
		component: any;
	};

	const formCreatorPlugins: Record<string, FormCreatorPlugin> = {};

	export const registerFormCreatorPlugin = (name: string, component: any) => {
		name = name.toLowerCase();
		formCreatorPlugins[name] = { name, component };
	};

	export const getFormCreatorPlugin = (name: string) => {
		name = name.toLowerCase();
		return formCreatorPlugins[name];
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import TagInput from './TagInput.svelte';
	import MarkdownInput from './MarkdownInput.svelte';
	import DraggableTree from './DraggableTree.svelte';
	import type { Size } from '$liwe3/types/types';
	import ElementList from './ElementList.svelte';
	import { addToast } from '$liwe3/stores/ToastStore';
	import Select from 'svelte-select';
	import { _ } from '$liwe3/stores/LocalizationStore';

	export let fields: FormField[] = [];
	export let values: Record<string, any> = {};
	export let submitLabel: string = 'Submit';
	export let resetLabel: string = 'Reset';
	export let showButtons: boolean = true;
	export let showReset: boolean = true;

	const dispatch = createEventDispatcher();

	const _check_required_fields = () => {
		const required: string[] = [];

		fields.forEach((field) => {
			if (field.required && typeof values[field.name] == 'undefined') {
				required.push(field.label ?? field.name);
			}
		});

		return required;
	};

	const handleSubmit = (e: Event) => {
		const missing = _check_required_fields();

		// verify required fields
		if (missing.length) {
			addToast({
				type: 'error',
				message:
					$_('Please fill all required fields:<br /><ul><li>') +
					missing.join('</li><li>') +
					'</li></ul>'
			});

			return;
		}

		dispatch('submit', values);
	};

	const onChangeField = async (name: string, e: any) => {
		let value;

		if (e.target) {
			value = e.target?.type === 'checkbox' ? e.target?.checked : e.target?.value;
		} else if (e.detail) {
			value = e.detail;
		} else {
			value = e;
		}

		const field = fields.find((f) => f.name === name);
		const onChange = field?.onChange;
		const valid = onChange ? await onChange(name, value, values) : true;

		if (!valid) return;

		if (valid) values[name] = value;

		dispatch('change', { name, value });
	};
</script>

<div class="form">
	<form on:submit|preventDefault|stopPropagation={handleSubmit}>
		<div class="liwe3-row">
			{#each fields as field}
				<div class={`liwe3-col${field.col ?? 12} ${field.align ? 'align-' + field.align : ''}`}>
					<div class="space">
						{#if field?.type === 'strange'}
							<!-- strange component here -->
						{:else if getFormCreatorPlugin(field?.type ?? '---')}
							<div class="title">{field.label}</div>
							<svelte:component
								this={getFormCreatorPlugin(field?.type ?? '---').component}
								{...field}
								value={(values[field.name] ?? '').toString()}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{:else if field?.type === 'text'}
							<!--<div class="title">{field.label}</div>-->
							<Input
								{...field}
								{...field.extra}
								name={field.name}
								value={values[field.name] ?? ''}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{:else if field?.type === 'title'}
							<div class="title">{field.label}</div>
						{:else if field?.type === 'tags'}
							<TagInput
								name={field.name}
								value={values[field.name] ?? ''}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{:else if field?.type === 'markdown'}
							<MarkdownInput
								name={field.name}
								value={values[field.name] ?? ''}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{:else if field?.type === 'element-list'}
							<div class="title">{field.label}</div>
							<ElementList
								name={field.name}
								value={values[field.name] ?? ''}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e.detail)}
							/>
						{:else if field?.type === 'draggable-tree'}
							<DraggableTree
								name={field.name}
								value={values[field.name] ?? ''}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{:else if field?.type === 'checkbox'}
							<div class="simple-row">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label>
									<Input
										type="checkbox"
										name={field.name}
										checked={values[field.name] ?? false}
										value="on"
										{...field.extra}
										on:change={(e) => onChangeField(field.name, e)}
									/>
									{field.label}
								</label>
							</div>
						{:else if field?.type === 'hidden'}
							<input type="hidden" name={field.name} value={values[field.name] ?? ''} />
						{:else if field?.type === 'select'}
							<Select
								name={field.name}
								value={values[field.name] ?? ''}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e.detail.value)}
								on:clear={() => onChangeField(field.name, '')}
								items={field.options ?? []}
							/>
						{:else}
							<Input
								{...field}
								value={(values[field.name] ?? '').toString()}
								{...field.extra}
								on:change={(e) => onChangeField(field.name, e)}
							/>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{#if showButtons}
			<div class="buttons">
				{#if showReset}
					<Button mode="danger" type="reset">{resetLabel}</Button>
				{/if}
				<Button mode="success" type="submit" on:click={handleSubmit}>{submitLabel}</Button>
			</div>
		{/if}
	</form>
</div>

<style>
	label {
		display: flex;
		flex-direction: row;
		align-items: center;
		user-select: none;
		gap: 0.5rem;
	}
	.form {
		width: 100%;
	}

	.space {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-end;

		padding-top: 0.5rem;
		padding-right: 0.5rem;

		width: 100%;
		height: 100%;
	}

	.form .buttons {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 2rem;
		margin-top: 1rem;
	}

	.simple-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.align-flex-start {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.align-flex-end {
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
	}

	.align-center {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}
</style>
