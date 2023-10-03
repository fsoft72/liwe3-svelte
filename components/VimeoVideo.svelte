<script lang="ts">
	import { mkid } from '$liwe3/utils/utils';
	import Player from '@vimeo/player';
	import { onMount, createEventDispatcher } from 'svelte';

	export let url: string = '';
	/** Whether to start playback of the video automatically. This feature might not work on all devices. */
	export let autoplay: boolean = false;

	/** Whether to display the video owner's name. */
	export let byline: boolean = false;

	/** Whether the player displays the title overlay. */
	export let title: boolean = false;

	/** Whether to display the player's interactive elements, including the play bar and sharing buttons. Set this option to false for a chromeless experience. To control playback when the play/pause button is hidden, set autoplay to true, use keyboard controls (which remain active), or implement our player SDK. */
	export let controls: boolean = true;

	/** The hexadecimal color values of the player. The embed settings of the video might override these values.
	 * The order of the player colors is [Primary, Accent, Text/Icon, Background],
	 * with corresponding default values of ["000000", "00ADEF", "FFFFFF", "000000"]. */
	export let colors: string[] | null = null;

	/** Whether to enable keyboard input to trigger player events. This setting doesn't affect tab control. */
	export let keyboard: boolean = true;

	/** Whether the player is in background mode, which hides the playback controls, enables autoplay, and loops the video. */
	export let background: boolean = false;

	/** Setting of 1 causes the player to play the initial video again and again. */
	export let loop: boolean = false;

	/** Whether to return a responsive embed code, or one that provides intelligent adjustments based on viewing conditions. We recommend this option for mobile-optimized sites. */
	export let responsive: boolean = false;

	/** 	Whether the player displays speed controls in the preferences menu and enables the playback rate API. */
	export let speed: boolean = false;

	export let width: number = 640;
	export let height: number = 360;

	/** Delta (in seconds) to fire a timeupdate event. */
	export let updateDelta: number = 1;

	let vid: HTMLDivElement;
	let id: string = mkid('vid');
	let lastTime: number = 0;

	const dispatch = createEventDispatcher();

	onMount(() => {
		const options = {
			url,
			width,
			height,
			dnt: true,
			autoplay,
			background,
			byline,
			colors,
			controls,
			keyboard,
			loop,
			responsive,
			speed,
			title
		};

		const player = new Player(vid, options);

		const events = ['play', 'pause', 'ended'];

		events.forEach((event: string) => {
			player.on(event, function (data: any) {
				dispatch(event, data);
			});
		});

		player.on('timeupdate', function (data: any) {
			const time = data.seconds;
			if (Math.abs(time - lastTime) > updateDelta) {
				dispatch('timeupdate', data);
				lastTime = time;
			}
		});
	});
</script>

<div bind:this={vid} {id} />
