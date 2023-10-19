<script lang="ts">
	import type { Color } from '$liwe3/types/types';

	export let text: string = '';
	export let percentage: number = 0;
	export let mode: Color = 'mode1';
</script>

<div class={`progress-bar ${mode}`}>
	<div class="progress-bar-fill" style={`width: ${percentage}%`} />
	<div class="text">{text}</div>
</div>

<style>
	.progress-bar {
		width: 100%;
		height: 20px;
		border: 1px solid var(--border);
		background-color: var(--color);
		border-radius: var(--liwe-border-radius);
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
		background-color: var(--darker);
		transition: width 0.3s ease-in-out;
	}
</style>
