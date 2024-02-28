<script lang="ts">
	import type { Color, Size } from '$liwe3/types/types';
	import Button from './Button.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { XCircle } from 'svelte-hero-icons';

	const dispatch = createEventDispatcher();
	type ModalCallback = (show: boolean) => void;

	export let title: string = '';
	export let size: Size | string | undefined = 'md';
	export let mode: Color = 'mode1';

	export let closeOnEsc: boolean = true;
	export let closeOnOutsideClick: boolean = true;

	export let padding = '0.5rem';
	export let showCloseButton = true;

	const onCloseOnOutside = (e: MouseEvent) => {
		if (closeOnOutsideClick && e.target === e.currentTarget) {
			dispatch('cancel', false);
		}
	};

	const onCloseOnEsc = (e: KeyboardEvent) => {
		if (closeOnEsc && e.key === 'Escape') {
			dispatch('cancel', false);
		}
	};

	onMount(() => {
		window.addEventListener('keydown', onCloseOnEsc);

		return () => {
			window.removeEventListener('keydown', onCloseOnEsc);
		};
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="liwe3-theme">
	<div class={`modal-container ${mode}`} on:click={onCloseOnOutside}>
		<div class={`modal ${size}`}>
			<div class="modal-header">
				<h3>{title}</h3>
				{#if showCloseButton}
					<Button
						size="sm"
						mode="info"
						on:click={() => {
							dispatch('cancel', false);
						}}
						icon={XCircle}
					/>
				{/if}
			</div>
			<div class="modal-body" style:padding>
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
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
		/* width: 100vw;
		height: 90vh;
		*/

		background-color: rgba(0, 0, 0, 0.5);

		display: flex;
		justify-content: center;
		align-items: center;

		backdrop-filter: blur(5px);

		overflow: auto;
	}

	.modal {
		border: 2px solid var(--liwe3-border-width);
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

		border-bottom: 1px solid var(--liwe3-border-width);
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

		border-top: 1px solid var(--liwe3-border-width);
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
</style>
