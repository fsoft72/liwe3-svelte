<script lang="ts">
	import type { Size } from '$liwe3/types/types';
	import Button from './Button.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { XCircle } from 'svelte-hero-icons';

	const dispatch = createEventDispatcher();
	type ModalCallback = (show: boolean) => void;

	export let title: string = '';
	export let size: Size | string | undefined = 'md';

	export let closeOnEsc: boolean = true;
	export let closeOnOutsideClick: boolean = true;

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
<div class="modal-container" on:click={onCloseOnOutside}>
	<div class={`modal ${size}`}>
		<div class="modal-header">
			<h3>{title}</h3>
			<Button
				size="sm"
				mode="danger"
				variant="outline"
				on:click={() => {
					dispatch('cancel', false);
				}}
				icon={XCircle}
			/>
		</div>
		<div class="modal-body">
			<slot />
		</div>
		{#if $$slots.footer}
			<div class="modal-footer">
				<slot name="footer" />
			</div>
		{/if}
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
		border: 2px solid var(--border-color);
		border-radius: 0.5rem;
		color: var(--text-color);

		background-color: var(--liwe-main-bg-color);

		box-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-radius: 0.5rem 0.5rem 0 0;

		border-bottom: 1px solid var(--liwe-border-color);
		padding: 0.5rem;

		background-color: var(--liwe-darker-secondary-color);
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1em;
		font-weight: 400;
	}

	.modal-body {
		padding: 0.5rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;

		border-radius: 0 0 0.5rem 0.5rem;

		border-top: 1px solid var(--border-color);
		padding: 0.5rem;

		background-color: var(--main-bg-darker);
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
