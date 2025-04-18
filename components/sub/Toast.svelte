<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		CheckCircle as SuccessIcon,
		ExclamationCircle as ErrorIcon,
		InformationCircle as InfoIcon,
		XMark as CloseIcon,
		Icon
	} from 'svelte-hero-icons';

	interface ToastProps {
		type?: 'success' | 'error' | 'info';
		dismissible?: boolean;
		title?: string;
		message?: string;

		// events
		ondismiss?: () => void;
	}

	let {
		type = 'error',
		dismissible = true,
		title = '',
		message = '',
		ondismiss
	}: ToastProps = $props();
</script>

<article class={type} role="alert" transition:fade>
	<div class="title">
		{#if type === 'success'}
			<Icon src={SuccessIcon} width="1.1em" />
		{:else if type === 'error'}
			<Icon src={ErrorIcon} width="1.1em" />
		{:else}
			<Icon src={InfoIcon} width="1.1em" />
		{/if}

		{title}

		{#if dismissible}
			<button
				class="close"
				onclick={() => {
					ondismiss && ondismiss();
				}}
			>
				<Icon src={CloseIcon} width="0.8em" />
			</button>
		{/if}
	</div>

	<div class="text">
		{@html message}
	</div>
</article>

<style>
	article {
		display: flex;
		flex-direction: column;

		border-radius: 0.5rem;

		margin: 0 auto 0.5rem auto;
		width: 20rem;
	}

	.title {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		border-radius: 0.5rem 0.5rem 0 0;
		padding: 0.5rem;

		/* make the background color just a bit darker using hsl */
		background: rgba(0, 0, 0, 0.25);
		color: white;

		gap: 0.7rem;

		user-select: none;
	}

	.error {
		background: var(--liwe3-error-500, IndianRed);
		color: var(--liwe3-error-500-text, white);
	}
	.success {
		background: var(--liwe3-success-500, MediumSeaGreen);
		color: var(--liwe3-success-500-text, white);
	}
	.info {
		background: var(--liwe3-info-500, SkyBlue);
		color: var(--liwe3-info-500-text, white);
	}

	.text {
		font-family: 'Roboto', sans-serif;
		margin-left: 1rem;
		padding: 1rem;
	}

	button {
		color: white;
		background: transparent;
		border: 0 none;
		padding: 0;
		margin: 0 0 0 auto;
		line-height: 1;
		font-size: 1rem;
	}
</style>
