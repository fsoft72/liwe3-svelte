<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let active: string = '';
	export let minHeight: string = '200px';
	export let height: string = '';

	interface TabInfo {
		id: string;
		title: string;
		component: HTMLElement;
	}

	let tabsDiv: HTMLDivElement;
	let tabsButtons: HTMLDivElement;

	let tabs: TabInfo[] = [];

	onMount(() => {
		const originalTabs = tabsDiv.querySelectorAll('.tab');

		originalTabs.forEach((tab: any) => {
			const id = tab.getAttribute('data-id') ?? '';
			const title = tab.getAttribute('data-title') ?? '';
			const component = tab.querySelector('.tab-content');

			if (!component) return;

			tabs.push({
				id,
				title,
				component
			});
		});

		tabs = tabs;

		if (tabs.length) {
			active = active || tabs[0].id;
		}
	});

	$: {
		if (browser && tabsButtons) {
			tabsButtons.innerHTML = '';
		}
	}

	$: {
		if (browser && tabs.length) {
			tabsDiv.innerHTML = '';
			tabsDiv.appendChild(tabs.find((tab) => tab.id === active)?.component ?? tabs[0].component);
		}
	}
</script>

<div class="container">
	<div class="tabs-buttons" bind:this={tabsButtons}>
		{#each tabs as tab (tab.id)}
			<div
				role="button"
				tabindex="0"
				class="tab-label"
				class:active={tab.id === active}
				on:click={() => (active = tab.id)}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						active = tab.id;
					}
				}}
			>
				{tab.title}
			</div>
		{/each}
	</div>
	<div class="tabs" bind:this={tabsDiv} style:height style:min-height={minHeight}>
		<slot />
	</div>
</div>

<style>
	.container {
		width: 100%;
		margin: 0 auto;
		position: relative;
		height: auto;

		box-shadow: 0 2px 3px 1px var(--liwe-darker-secondary-color);
	}

	.tabs {
		position: relative;
		height: auto;
		display: flex;
		padding: 1rem 0.5rem;
		background: var(--liwe-paper-color);
	}

	.tabs-buttons {
		position: relative;
		display: flex;
	}

	.tab-label {
		cursor: pointer;
		background: var(--liwe-lighter-primary-color);
		border-left: 1px solid var(--liwe-darker-secondary-color);
		border-right: 1px solid var(--liwe-darker-secondary-color);
		border-top: 1px solid var(--liwe-darker-secondary-color);
		color: var(--liwe-dark-colo);

		padding: 1rem;

		user-select: none;
	}

	.tab-label.active {
		background: var(--liwe-paper-color);
	}
</style>
