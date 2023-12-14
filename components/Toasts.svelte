<script lang="ts">
	import Toast from './sub/Toast.svelte';

	import { dismissToast, toasts } from '$liwe3/stores/ToastStore';
</script>

{#if $toasts}
	<section>
		{#each $toasts as toast (toast.id)}
			<Toast
				type={toast.type}
				dismissible={toast.dismissible}
				on:dismiss={() => dismissToast(toast.id ?? 0)}
				title={toast.title}
				message={toast.message}
			/>
		{/each}
	</section>
{/if}

<style>
	section {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		margin-top: 1rem;
		justify-content: center;
		flex-direction: column;
		z-index: 20000;
	}
</style>
