<script module lang="ts">
	export type ModalAction = {
		label: string;
		mode?: Color;
		action: Function;
	};

	export interface ModalProps {
		title: string;
		size?: Size | string;
		mode?: Color;
		closeOnEsc?: boolean;
		closeOnOutsideClick?: boolean;
		padding?: string;
		showCloseButton?: boolean;
		actions?: ModalAction[];

		oncancel?: (cancel: boolean) => void;
		onclose?: (close: boolean) => void;

		children?: any;
	}
</script>

<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import { XCircle } from 'svelte-hero-icons';

	let {
		title = '',
		size = 'md',
		mode = 'mode1',
		closeOnEsc = true,
		closeOnOutsideClick = true,
		padding = '',
		showCloseButton = true,
		actions = [],
		oncancel,
		onclose,
		children
	}: ModalProps = $props();

	let bodyOverflow: string = $state('');

	const setBodyOverflow = {
		orig: () => {
			bodyOverflow = document.body.style.overflow || '';
		},
		open: () => (document.body.style.overflow = 'hidden'),
		close: () => (document.body.style.overflow = bodyOverflow)
	};

	const onCloseOnOutside = (e: MouseEvent) => {
		if (closeOnOutsideClick && e.target === e.currentTarget) {
			setBodyOverflow.close();
			oncancel && oncancel(false);
		}
	};

	const onCloseOnEsc = (e: KeyboardEvent) => {
		if (closeOnEsc && e.key === 'Escape') {
			setBodyOverflow.close();
			oncancel && oncancel(false);
		}
	};

	onMount(() => {
		window.addEventListener('keydown', onCloseOnEsc);
		setBodyOverflow.orig();
		setBodyOverflow.open();

		return () => {
			setBodyOverflow.close();
			window.removeEventListener('keydown', onCloseOnEsc);
		};
	});
</script>

<div class="liwe3-theme">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class={`modal-container ${mode}`} onclick={onCloseOnOutside}>
		<div class={`modal ${size}`}>
			<div class="modal-header">
				<h3>{title}</h3>
				{#if actions.length}
					<div class="actions">
						{#each actions as action}
							<Button
								size="sm"
								mode={action.mode || 'primary'}
								onclick={() => {
									action.action();
								}}
							>
								{action.label}
							</Button>
						{/each}
					</div>
				{/if}
				{#if showCloseButton}
					<Button
						size="sm"
						mode="danger"
						onclick={() => {
							oncancel && oncancel(false);
						}}
						icon={XCircle}
					/>
				{/if}
			</div>
			<div class="modal-body" style:padding>
				{@render children()}
			</div>
			<!--
			<div class="modal-footer">
				{@render children('footer')}
			</div>
		-->
		</div>
	</div>
</div>

<style>
	.modal-container {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 2000;
		bottom: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.5);

		display: flex;
		justify-content: center;
		align-items: center;

		backdrop-filter: blur(5px);

		overflow: auto;
	}

	.modal {
		border: 2px solid var(--liwe3-button-border);
		border-radius: var(--liwe3-border-radius);
		color: var(--liwe3-color);

		background-color: var(--liwe3-lighter-tertiary-color);

		box-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: var(--liwe3-border-radius) var(--liwe3-border-radius) 0 0;

		border-bottom: 1px solid var(--liwe3-button-border);
		padding: 0.5rem;

		background-color: var(--liwe3-darker-tertiary-color);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1em;
		font-weight: 400;
		color: var(--liwe3-darker-tertiary-color-text);
	}

	.modal-body {
		/* padding: 0.5rem; */

		max-height: 90vh;
		overflow: auto;

		scrollbar-width: thin;

		/* background-color: var(--light); */
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;

		border-radius: 0 0 0.5rem 0.5rem;

		border-top: 1px solid var(--liwe3-button-border);
		padding: 0.5rem;

		background-color: var(--liwe3-dark-tertiary-color);
	}

	.xs {
		width: 20vw;
	}

	.sm {
		width: 30vw;
	}

	.md {
		min-width: 50vw;
	}

	.lg {
		width: 80vw;
	}

	.xl {
		width: 90vw;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}
</style>
