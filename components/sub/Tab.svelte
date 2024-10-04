<script lang="ts">
	import { mkid } from '../../utils/utils';

	interface TabProps {
		id?: string;
		title?: string;

		children?: any;
	}

	let { id = mkid('tab'), title = 'Tab', children }: TabProps = $props();
</script>

<div class="tab" data-id={id} data-title={title}>
	<div class="tab-content">
		{@render children()}
	</div>
</div>

<style>
	.tab-content {
		width: 100%;
	}
</style>
