<script module lang="ts">
	import type { IconSource } from 'svelte-hero-icons';

	export type FormField = {
		id?: string;
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

		// if true, the field will not be displayed
		hide?: boolean;

		// list of perms the user must have to see this field
		perms?: string[];

		// functions that can be exposed by the field
		submit?: () => Promise<boolean>;

		// events
		onchange?: (name: string, value: any, values: Record<string, any>) => Promise<boolean>;
		onsubmit?: (values: Record<string, any>) => void;
		onclick?: () => void;
	};

	type FormCreatorPlugin = {
		name: string;
		component: any;
		extra?: Record<string, any>;
		validate?: (field: FormField, values: Record<string, any>) => string[];
	};

	const formCreatorPlugins: Record<string, FormCreatorPlugin> = {};

	export const formCreatorPluginRegister = (
		name: string,
		component: any,
		extra?: Record<string, any>
	) => {
		name = name.toLowerCase();
		let validate = extra?.validate;
		delete extra?.validate;

		formCreatorPlugins[name] = { name, component, extra, validate };
	};

	export const formCreatorPluginGet = (name: string) => {
		name = name.toLowerCase();
		const plug = formCreatorPlugins[name];

		return plug;
	};

	/** Check if all required fields of multiple FormCreator instances are filled
	 * @param formFields - array of form FormCreator fields
	 * @param data - object with all the form fields values from all FormCreator instances
	 **/
	export const checkRequiredFields = (formFields: FormField[][], data: Record<string, any>) => {
		const required: string[] = [];
		formFields.forEach((fields) => {
			fields.forEach((field) => {
				//if ( field.required && typeof data[ field.name ] === 'undefined' || data[ field.name ] === '' ) {
				if (field.required && !data[field.name]) {
					required.push(field.label ?? field.name);
				}
			});
		});
		return required;
	};
</script>

<script lang="ts">
	import type { Size } from '$liwe3/types/types';
	import { addToast } from '$liwe3/stores/ToastStore.svelte';
	import LocalizationStore from '$liwe3/stores/LocalizationStore.svelte';
	import { has_one_perm, isTrue } from '$liwe3/utils/utils';
	import { storeUser } from '$modules/user/store.svelte';
	import Button from '$liwe3/components/Button.svelte';
	import { runeDebug } from '$liwe3/utils/runes.svelte';

	const _ = LocalizationStore._;

	interface Props {
		fields: FormField[];
		values?: Record<string, any>;
		submitLabel?: string;
		resetLabel?: string;
		showButtons?: boolean;
		showReset?: boolean;

		nameField?: string;

		// events
		onsubmit?: (values: Record<string, any>) => void;
		onchange?: (name: string, value: any) => void;
	}

	let {
		fields = [],
		values = $bindable({}),
		submitLabel = 'Submit',
		resetLabel = 'Reset',
		showButtons = true,
		showReset = true,

		nameField = 'name',

		// events
		onsubmit,
		onchange
	}: Props = $props();

	let formID: HTMLFormElement;
	let formFieldInstances: Record<string, any> = $state({});

	export const checkRequiredFields = () => {
		const required: string[] = [];

		fields.forEach((field) => {
			// if the field is hidden for the user, we cannot validate its fields
			if (field.hide) return;

			// Check plugin validation if available
			const plugin = formCreatorPluginGet(field?.type ?? '---');
			if (plugin?.validate) {
				const pluginErrors = plugin.validate(field, values);
				if (pluginErrors.length) required.push(...pluginErrors);
			}

			// Check standard required fields
			if (field.required && typeof values[(field as any)[nameField]] == 'undefined') {
				required.push(field.label ?? field.name);
				return;
			}
		});

		return required;
	};

	/* This function will scan all fields and, if the field has a 'submit' function,
	 * it will call it with the field value and the form values.
	 */
	export const handleFieldSubmit = async () => {
		let res = true;

		await Promise.all(
			fields.map(async (field) => {
				let p = formFieldInstances[field.name];
				if (!p || !p.submit) return;

				return p.submit();
			})
		).catch((err) => {
			console.log('=== FormCreator/handleFieldSubmit: ', err);
			res = false;
		});

		return res;
	};

	/**
	 * This function can be called programatically to submit the form.
	 * It is the function that is also called internally when the user clicks 'submit'.
	 * The function calls these other functions:
	 * - handleFieldSubmit: this function will call the submit function of each field that has one.
	 * - checkRequiredFields: this function will check if all required fields are filled.
	 *
	 * If everything is OK, it will also call the onsubmit callback with the form values.
	 *
	 * @param e - the event that triggered the submit
	 */
	export const handleSubmit = async (e?: Event) => {
		if (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
		}

		const isValid = await handleFieldSubmit();
		if (!isValid) return;

		const missing = checkRequiredFields();

		// verify required fields
		if (missing.length) {
			addToast({
				type: 'error',
				message:
					_('Please fill all required fields:<br /><ul><li>') +
					missing.join('</li><li>') +
					'</li></ul>'
			});

			return;
		}

		onsubmit && onsubmit(values);
	};

	const onChangeField = async (name: string, e: any, fld: FormField) => {
		let value;

		if (e.target) {
			value = e.target?.type === 'checkbox' ? e.target?.checked : e.target?.value;
		} else if (e.detail) {
			value = e.detail;
		} else {
			value = e;
		}

		runeDebug('=== FormCreator/onChangeField: ', name, value, fld.name);

		const field = fields.find((f) => f.name === name);
		const onChange = field?.onchange;
		const valid = onChange ? await onChange(name, value, values) : true;

		if (!valid) return;

		if (valid) values[name] = value;

		onchange && onchange(name, value);
	};

	const _v = (field: FormField) => {
		let v = values[(field as any)[nameField]] ?? '';

		if (v === undefined) v = field?.default;
		if (v === undefined) v = '';

		return v;
	};

	const resetForm = () => {
		formID.reset();
	};
</script>

{#snippet renderPlugin(plugin: FormCreatorPlugin, field: FormField)}
	{#if plugin}
		<plugin.component
			this={plugin.component}
			bind:this={formFieldInstances[field.name]}
			{_v}
			{...plugin.extra ?? {}}
			name={(field as any)[nameField]}
			value={_v(field)}
			{field}
			{...field?.extra ?? {}}
			onchange={onChangeField}
		/>
	{/if}
{/snippet}

<div class="form">
	<form onsubmit={handleSubmit} bind:this={formID}>
		<div class="liwe3-row">
			{#each fields as field}
				<div class={`liwe3-col${field?.col ?? 12} ${field?.align ? 'align-' + field?.align : ''}`}>
					<div class="space">
						{#if has_one_perm(storeUser, field?.perms ?? []) && !field?.hide}
							{@const p = formCreatorPluginGet(field?.type ?? '---')}
							{@render renderPlugin(p, field)}
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{#if showButtons}
			<div class="buttons">
				{#if showReset}
					<Button mode="danger" type="reset" onclick={resetForm}>{resetLabel}</Button>
				{/if}
				<Button mode="success" type="submit" onclick={handleSubmit}>{submitLabel}</Button>
			</div>
		{/if}
	</form>
</div>

<style>
	.label {
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
