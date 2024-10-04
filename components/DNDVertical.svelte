<script lang="ts">
	import { mkid, values } from '$liwe3/utils/utils';
	import { onMount } from 'svelte';

	const ID_NAME = 'data-dnd-id';

	interface DNDVerticalProps {
		children: any;
	}

	let { children }: DNDVerticalProps = $props();
	let items: Record<string, HTMLElement> = $state({});
	let itemsOrder: string[] = $state([]);

	let container: HTMLDivElement;

	const _initElems = () => {
		const elems = container.children[0].children;
		const total = container.children[0].children.length;

		for (let i = 0; i < total; i++) {
			const id = mkid('it');
			const item = elems[i] as HTMLElement;

			// set custom data attribute to store the item id
			item.setAttribute(ID_NAME, id);

			// Save the current id in the current pos (for reordering)
			itemsOrder.push(id);

			// save item in the items object
			items[id] = item;
		}

		container.children[0].remove();
	};

	const _ev_dragstart = (ev: DragEvent) => {
		if (!ev.dataTransfer) return;

		const id = (ev.target as HTMLElement)?.getAttribute(ID_NAME);
		if (!id) return;

		console.log('=== SOURCE: ', id);

		ev.dataTransfer.setData('text/plain', id);
		// ev.dataTransfer.dropEffect = 'move';
	};

	const _ev_dragover = (ev: DragEvent) => {
		ev.preventDefault();
		if (!ev.dataTransfer) return;
		ev.dataTransfer.dropEffect = 'move';

		const dest = ev.target as HTMLElement;
		if (!dest) return;

		dest.style.border = '1px dashed yellow';
	};

	const _ev_dragleave = (ev: DragEvent) => {
		ev.preventDefault();
		const dest = ev.target as HTMLElement;
		if (!dest) return;

		dest.style.border = '';
	};

	const _swapElements = (sourceId: string, destId: string) => {
		itemsOrder = itemsOrder.map((id) => {
			if (id === sourceId) return destId;
			if (id === destId) return sourceId;
			return id;
		});

		render();
	};

	const _ev_drop = (ev: DragEvent) => {
		ev.preventDefault();

		if (!ev.dataTransfer) return;
		const sourceId = ev.dataTransfer.getData('text/plain');

		const dest = ev.target as HTMLElement;
		if (!dest) return;

		dest.style.border = '';

		const destId = dest.getAttribute(ID_NAME);
		if (!destId) return;

		if (destId === sourceId) return;

		_swapElements(sourceId, destId);
	};

	const _injectEvents = () => {
		values<HTMLElement>(items).forEach((item) => {
			item.draggable = true;

			item.addEventListener('dragstart', _ev_dragstart);
			item.addEventListener('dragover', _ev_dragover);
			item.addEventListener('dragleave', _ev_dragleave);
			item.addEventListener('drop', _ev_drop);
		});
	};

	const render = () => {
		container.innerHTML = '';

		itemsOrder.forEach((id) => {
			container.appendChild(items[id]);
		});
	};

	onMount(() => {
		console.log('DNDVertical mounted', container);

		_initElems();
		_injectEvents();
		render();
	});
</script>

<div bind:this={container} class="dnd-vertical">
	<div class="hidden">
		{@render children()}
	</div>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
