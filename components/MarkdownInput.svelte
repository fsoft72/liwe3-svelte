<script lang="ts">
	import type { Color } from '$liwe3/types/types';
	import SvelteMarkdown from 'svelte-markdown';

	export let value = '';
	export let name = '';
	export let mode: Color = 'mode1';
	export let rows = 10;
	export let cols = 30;

	let mdtext = '';
	let preview: boolean = false;

	$: if (preview) {
		mdtext = value;
	} else {
		mdtext = '';
	}
</script>

<div class={`container ${mode}`}>
	<div style="text-align: right">
		<input type="checkbox" bind:checked={preview} id="_chk" />
		<label for="_chk">Preview</label>
	</div>
	<div class:show={!preview} class="editor">
		<textarea {name} {rows} {cols} bind:value on:change />
	</div>
	<div class:show={preview} class="preview">
		<SvelteMarkdown source={mdtext} />
	</div>
</div>

<style>
	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;

		width: 100%;
	}

	.editor,
	.preview {
		width: 100%;
		display: none;
	}

	.preview {
		position: relative;
		border: 1px solid var(--border);
		height: 100%;
	}

	textarea {
		width: 100%;
		height: 100%;
		padding: 0.5rem;
	}

	.show {
		display: block;
	}
</style>
