<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		CheckCircle as SuccessIcon,
		ExclamationCircle as ErrorIcon,
		InformationCircle as InfoIcon,
		XMark as CloseIcon,
		Icon
	} from 'svelte-hero-icons';

	const dispatch = createEventDispatcher();

	export let type = 'error';
	export let dismissible = true;
</script>

<article class={type} role="alert" transition:fade>
	{#if type === 'success'}
		<Icon src={SuccessIcon} width="1.1em" />
	{:else if type === 'error'}
		<Icon src={ErrorIcon} width="1.1em" />
	{:else}
		<Icon src={InfoIcon} width="1.1em" />
	{/if}

	<div class="text">
		<slot />
	</div>

	{#if dismissible}
		<button class="close" on:click={() => dispatch('dismiss')}>
			<Icon src={CloseIcon} width="0.8em" />
		</button>
	{/if}
</article>

<style>
	article {
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.2rem;
		display: flex;
		align-items: center;
		margin: 0 auto 0.5rem auto;
		width: 20rem;
	}
	.error {
		background: IndianRed;
	}
	.success {
		background: MediumSeaGreen;
	}
	.info {
		background: SkyBlue;
	}
	.text {
		font-family: 'Roboto', sans-serif;
		margin-left: 1rem;
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
