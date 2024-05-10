<script lang="ts">
	import { mkid } from '$liwe3/utils/utils';
	import Player from '@vimeo/player';
	import { onMount } from 'svelte';

	interface VimeoVideoProps {
		url: string;
		autoplay?: boolean; // Whether to start playback of the video automatically. This feature might not work on all devices.
		byline?: boolean; // Whether to display the video owner's name.
		title?: boolean; // Whether the player displays the title overlay.
		controls?: boolean; // Whether to display the player's interactive elements, including the play bar and sharing buttons. Set this option to false for a chromeless experience. To control playback when the play/pause button is hidden, set autoplay to true, use keyboard controls (which remain active), or implement our player SDK.
		colors?: string[] | null; // The hexadecimal color values of the player. The embed settings of the video might override these values. The order of the player colors is [Primary, Accent, Text/Icon, Background], with corresponding default values of ["000000", "00ADEF", "FFFFFF", "000000"].
		keyboard?: boolean; // Whether to enable keyboard input to trigger player events. This setting doesn't affect tab control.
		background?: boolean; // Whether the player is in background mode, which hides the playback controls, enables autoplay, and loops the video.
		loop?: boolean; // Setting of 1 causes the player to play the initial video again and again.
		responsive?: boolean; // Whether to return a responsive embed code, or one that provides intelligent adjustments based on viewing conditions. We recommend this option for mobile-optimized sites.
		speed?: boolean; // Whether the player displays speed controls in the preferences menu and enables the playback rate API.
		width?: number; // The width of the player.
		height?: number; // The height of the player.
		updateDelta?: number; // Delta (in seconds) to fire a timeupdate event.

		onplay?: (data: any) => void;
		onpause?: (data: any) => void;
		onended?: (data: any) => void;
		timeupdate?: (data: any) => void;
	}

	let {
		url = '',
		autoplay = false,
		byline = false,
		title = false,
		controls = true,
		colors = null,
		keyboard = true,
		background = false,
		loop = false,
		responsive = false,
		speed = false,
		width = 640,
		height = 360,
		updateDelta = 1,

		// events
		onplay,
		onpause,
		onended,
		timeupdate
	}: VimeoVideoProps = $props();

	let vid: HTMLDivElement;
	let id: string = mkid('vid');
	let lastTime: number = 0;

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

		player.on('play', function (data: any) {
			onplay && onplay(data);
		});

		player.on('pause', function (data: any) {
			onpause && onpause(data);
		});

		player.on('ended', function (data: any) {
			onended && onended(data);
		});

		player.on('timeupdate', function (data: any) {
			const time = data.seconds;
			if (Math.abs(time - lastTime) > updateDelta) {
				timeupdate && timeupdate(data);
				lastTime = time;
			}
		});
	});
</script>

<div bind:this={vid} {id}></div>
