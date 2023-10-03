<script lang="ts">
	export let text: string = '';
	export let percentage: number = 0;
</script>

<div class="progress-bar">
	<div class="progress-bar-fill" style={`width: ${percentage}%`} />
	<div class="text">{text}</div>
</div>

<style>
	.progress-bar {
		width: 100%;
		height: 20px;
		border: 1px solid var(--liwe-darker-secondary-color);
		background-color: var(--liwe-primary-color);
		border-radius: 2px;
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
		background-color: var(--liwe-darker-primary-color);
		transition: width 0.3s ease-in-out;
	}
</style>
