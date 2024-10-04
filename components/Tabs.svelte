<script lang="ts">
	import { browser } from '$app/environment';
	import type { Color } from '$liwe3/types/types';
	import { onMount } from 'svelte';

	let {
		active,
		minHeight = '',
		height = '',
		mode = 'mode3',
		children
	}: {
		active?: string;
		minHeight?: string;
		height?: string;
		mode?: Color;
		children: any;
	} = $props();

	interface TabInfo {
		id: string;
		title: string;
		component: HTMLElement;
	}

	let tabsDiv: HTMLDivElement | undefined = $state();

	let tabs: TabInfo[] = $state([]);

	onMount(() => {
		if (!tabsDiv) return;

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

	$effect(() => {
		if (!tabsDiv) return;

		if (browser && tabs.length) {
			tabsDiv.innerHTML = '';
			tabsDiv.appendChild(tabs.find((tab) => tab.id === active)?.component ?? tabs[0].component);
		}
	});
</script>

<div class="liwe3-tabs">
	<div class={`container ${mode}`}>
		<div class="tabs-buttons">
			{#each tabs as tab (tab.id)}
				<div
					role="button"
					tabindex="0"
					class="tab-label"
					class:active={tab.id === active}
					onclick={() => (active = tab.id)}
					onkeydown={(e) => {
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
			{@render children()}
		</div>
	</div>
</div>

<style>
	.liwe3-tabs {
		width: 100%;
	}

	.container {
		width: 100%;
		margin: 0 auto;
		position: relative;
		height: auto;

		border: 1px solid var(--liwe3-border-color);
		border-radius: var(--liwe3-border-radius);

		/* box-shadow: 0 2px 3px 1px #000000; */
	}

	.tabs {
		position: relative;
		height: auto;
		display: flex;
		padding: 0;

		background: var(--liwe3-background-color);
		width: 100%;
	}

	.tabs-buttons {
		position: relative;
		display: flex;
	}

	.tab-label {
		cursor: pointer;
		background: var(--liwe3-lighter-primary-color);
		border-left: 1px solid var(--liwe3-border-color);
		border-right: 1px solid var(--liwe3-border-color);
		border-top: 1px solid var(--liwe3-border-color);
		color: var(--color);

		padding: 1rem;

		user-select: none;
	}

	.tab-label.active {
		background: var(--liwe3-paper);
	}
</style>
