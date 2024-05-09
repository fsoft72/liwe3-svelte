<script lang="ts">
	import type { Color } from '$liwe3/types/types';
	import { marked } from 'marked';

	interface _props {
		value?: string;
		name?: string;
		mode?: Color;
		rows?: number;
		cols?: number;
		height?: string;

		onchange?: (e: Event) => void;
	}

	let {
		value = '',
		name = '',
		mode = 'mode1',
		rows = 10,
		cols = 30,
		height = '300px',
		onchange
	}: _props = $props();

	let preview: boolean = $state(false);
	let mdtext = $derived(preview ? value : '');
</script>

<div class={`container ${mode}`}>
	<div style="text-align: right">
		<input type="checkbox" bind:checked={preview} id="_chk" />
		<label for="_chk">Preview</label>
	</div>
	<div class="box" style="height: {height}">
		<div class:show={!preview} class="editor">
			<textarea {name} {rows} {cols} bind:value {onchange}></textarea>
		</div>
		<div class:show={preview} class="preview">
			{@html marked.parse(mdtext, { gfm: true })}
		</div>
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

	.box {
		width: 100%;
	}

	.editor,
	.preview {
		width: 100%;
		height: 100%;
		display: none;
		border: 1px solid var(--liwe3-button-border);
	}

	.preview {
		position: relative;
		padding: 0.5rem;
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
