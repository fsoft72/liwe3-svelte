<script lang="ts">
	export let id: string = new Date().getTime().toString();
	export let title: string = 'Tab';
</script>

<div class="tab" data-id={id} data-title={title}>
	<div class="tab-content">
		<slot />
	</div>
</div>

<style>
	.tab-content {
		width: 100%;
	}
</style>
