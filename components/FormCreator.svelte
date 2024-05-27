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
		default?: any;

		// list of perms the user must have to see this field
		perms?: string[];

		// events
		onchange?: (name: string, value: any, values: Record<string, any>) => Promise<boolean>;
		onsubmit?: (values: Record<string, any>) => void;
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
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import TagInput from './TagInput.svelte';
	import MarkdownInput from './MarkdownInput.svelte';
	import DraggableTree from './DraggableTree.svelte';
	import type { Size } from '$liwe3/types/types';
	import ElementList from './ElementList.svelte';
	import { addToast } from '$liwe3/stores/ToastStore.svelte';
	import Select from 'svelte-select';
	import { _ } from '$liwe3/stores/LocalizationStore';
	import { has_one_perm, has_perm, isTrue } from '$liwe3/utils/utils';
	import { user } from '$modules/user/store';

	interface Props {
		fields: FormField[];
		values?: Record<string, any>;
		submitLabel?: string;
		resetLabel?: string;
		showButtons?: boolean;
		showReset?: boolean;

		// events
		onsubmit?: (values: Record<string, any>) => void;
		onchange?: (name: string, value: any) => void;
	}

	let {
		fields = [],
		values = {},
		submitLabel = 'Submit',
		resetLabel = 'Reset',
		showButtons = true,
		showReset = true,

		// events
		onsubmit,
		onchange
	}: Props = $props();

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
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();

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

		onsubmit && onsubmit(values);
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
		const onChange = field?.onchange;
		const valid = onChange ? await onChange(name, value, values) : true;

		if (!valid) return;

		if (valid) values[name] = value;

		onchange && onchange(name, value);
	};

	const _v = (field: FormField) => {
		let v = values[field.name];

		if (v === undefined) v = field.default;
		if (v === undefined) v = '';

		return v;
	};
</script>

<div class="form">
	<form onsubmit={handleSubmit}>
		<div class="liwe3-row">
			{#each fields as field}
				<div class={`liwe3-col${field.col ?? 12} ${field.align ? 'align-' + field.align : ''}`}>
					<div class="space">
						{#if has_one_perm($user, field.perms || [])}
							{#if field?.type === 'strange'}
								<!-- strange component here -->
							{:else if getFormCreatorPlugin(field?.type ?? '---')}
								<div class="title">{field.label}</div>
								<svelte:component
									this={getFormCreatorPlugin(field?.type ?? '---').component}
									{...field}
									value={_v(field).toString()}
									{...field.extra}
									onchange={(e: any) => onChangeField(field.name, e)}
								/>
							{:else if field?.type === 'text'}
								<!--<div class="title">{field.label}</div>-->
								<Input
									{...field}
									{...field.extra}
									name={field.name}
									value={_v(field)}
									onchange={(e:any) => onChangeField(field.name, e)}
								/>
							{:else if field?.type === 'title'}
								<div class="title">{field.label}</div>
							{:else if field?.type === 'tags'}
								<TagInput
									name={field.name}
									value={_v(field)}
									{...field.extra}
									onchange={(e:any) => onChangeField(field.name, e)}
								/>
							{:else if field?.type === 'markdown'}
								<MarkdownInput
									name={field.name}
									value={_v(field)}
									{...field.extra}
									onchange={(e:any) => onChangeField(field.name, e)}
								/>
							{:else if field?.type === 'element-list'}
								<div class="title">{field.label}</div>
								<ElementList
									name={field.name}
									value={_v(field)}
									{...field.extra}
									onchange={(e:any) => onChangeField(field.name, e.detail)}
								/>
							{:else if field?.type === 'draggable-tree'}
								<DraggableTree
									name={field.name}
									value={_v(field)}
									{...field.extra}
									onchange={(e:any) => onChangeField(field.name, e)}
								/>
							{:else if field?.type === 'checkbox'}
								<div class="simple-row">
									<label for={field.name}>
										<Input
											type="checkbox"
											name={field.name}
											checked={isTrue(_v(field))}
											value="on"
											{...field.extra}
											onchange={(e:any) => onChangeField(field.name, e)}
										/>
										{field.label}
									</label>
								</div>
							{:else if field?.type === 'hidden'}
								<input type="hidden" name={field.name} value={_v(field)} />
							{:else if field?.type === 'select'}
								<div class="custom-select">
									{#if field.label}
										<div class="label">{field.label}</div>
									{/if}
									<div class="svelte-select mode3" style="width: 100%">
										<Select
											name={field.name}
											value={_v(field)}
											placeholder={field.placeholder}
											{...field.extra}
											on:change={(e:any) => onChangeField(field.name, e.detail.value)}
											on:clear={() => onChangeField(field.name, '')}
											items={field.options ?? []}
										/>
									</div>
								</div>
							{:else}
								<Input
									{...field}
									value={_v(field).toString()}
									{...field.extra}
									onchange={(e:any) => onChangeField(field.name, e)}
								/>
							{/if}
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
				<Button mode="success" type="submit" onclick={handleSubmit}>{submitLabel}</Button>
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

	.custom-select {
		position: relative;
		width: 100%;
		top: -4px;
	}

	.label {
		font-size: 0.6rem;
		margin-bottom: 0.2rem;
	}
</style>
