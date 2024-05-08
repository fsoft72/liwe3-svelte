<script lang="ts">
	import { mkid } from '../../utils/utils';

	export let id: string = mkid('tab');
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
