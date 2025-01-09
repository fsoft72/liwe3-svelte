<script lang="ts">
	import Button from './Button.svelte';

	// Types for the component props
	interface Props {
		/** Text to be copied or function that returns text */
		text: string | (() => string);
		/** Optional custom class for the button */
		class?: string;
		/** Optional success message */
		successMessage?: string;
		/** Optional error message */
		errorMessage?: string;
		/** Duration to show the feedback message in ms */
		feedbackDuration?: number;
	}

	let {
		text,
		class: className = '',
		successMessage = 'Copied!',
		errorMessage = 'Failed to copy',
		feedbackDuration = 2000
	}: Props = $props();

	// State for handling copy feedback
	let isCopied = $state(false);
	let hasError = $state(false);
	let feedbackText = $derived(hasError ? errorMessage : successMessage);

	/**
	 * Handles the copy operation and manages feedback states
	 */
	const handleCopy = async () => {
		try {
			const valueToCopy = typeof text === 'function' ? text() : text;
			await navigator.clipboard.writeText(valueToCopy);
			isCopied = true;
			hasError = false;

			console.log('=== Copied: ', valueToCopy);
		} catch (err) {
			console.error('Failed to copy text:', err);
			isCopied = true;
			hasError = true;
		}

		// Reset state after duration
		setTimeout(() => {
			isCopied = false;
			hasError = false;
		}, feedbackDuration);
	};
</script>

<Button onclick={handleCopy} aria-label={isCopied ? feedbackText : 'Copy to clipboard'}>
	{#if isCopied}
		<span class="feedback" class:error={hasError} class:success={!hasError}>
			{feedbackText}
		</span>
	{:else}
		Copy to Clipboard
	{/if}
</Button>

<style>
	.success {
		background: #4caf50;
		color: white;
	}

	.error {
		background: #f44336;
		color: white;
	}

	.feedback {
		font-size: 0.875rem;
	}
</style>
