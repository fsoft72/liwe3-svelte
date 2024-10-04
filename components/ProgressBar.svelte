<script lang="ts">
	import type { Color } from '$liwe3/types/types';

	interface _props {
		text?: string;
		percentage?: number;
		mode?: Color;
	}

	let { text = '', percentage = 0, mode = 'mode1' }: _props = $props();
</script>

<div class={`progress-bar ${mode}`}>
	<div class="progress-bar-fill" style={`width: ${percentage}%`}></div>
	<div class="text">{text}</div>
</div>

<style>
	.progress-bar {
		width: 100%;
		height: 20px;
		border: 1px solid var(--liwe3-button-border);
		background-color: var(--liwe3-paper);
		border-radius: var(--liwe3-border-radius);
		overflow: hidden;

		position: relative;
	}

	.text {
		position: absolute;

		font-size: 12px;
		left: 10px;
		right: 0;
		top: 2px;
		text-align: left;
	}

	.progress-bar-fill {
		height: 100%;
		background-color: var(--liwe3-darker-paper);
		transition: width 0.3s ease-in-out;
	}
</style>
