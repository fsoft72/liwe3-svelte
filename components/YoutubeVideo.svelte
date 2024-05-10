<script lang="ts">
	import { mkid } from '$liwe3/utils/utils';
	import { onMount } from 'svelte';
	import YouTubePlayer from 'youtube-player';

	interface YoutubeVideoProps {
		/** Whether to start playback of the video automatically. This feature might not work on all devices. */
		autoplay: boolean;
		/** Whether to display the player's interactive elements, including the play bar and sharing buttons. Set this option to false for a chromeless experience. To control playback when the play/pause button is hidden, set autoplay to true, use keyboard controls (which remain active), or implement our player SDK. */
		controls: boolean;
		/** Whether to enable keyboard input to trigger player events. This setting doesn't affect tab control. */
		keyboard: boolean;
		/** Setting of 1 causes the player to play the initial video again and again. */
		loop: boolean;
		/** Delta (in seconds) to fire a timeupdate event. */
		updateDelta: number;
		url: string;
		width: number;
		height: number;

		// events
		onplay?: (data: any) => void;
		onpause?: (data: any) => void;
		onended?: (data: any) => void;
		ontimeupdate?: (data: any) => void;
		onduration?: (duration: number) => void;
	}

	let {
		autoplay = false,
		controls = true,
		keyboard = true,
		loop = false,
		updateDelta = 1,
		url = 'https://www.youtube.com/watch?v=mbQa2VWcFiI',
		width = 640,
		height = 360,

		// events
		onplay,
		onpause,
		onended,
		ontimeupdate,
		onduration
	}: YoutubeVideoProps = $props();

	let vid: HTMLDivElement;
	let id: string = mkid('vid');
	let player: any;
	let lastTime: number = 0;

	onMount(() => {
		if (!url) return;
		// extract the code by YouTube url removing also the query string
		const code = url.split('v=')[1].split('&')[0];

		console.log('=== VID: ', vid.offsetWidth, vid.offsetHeight);

		const final_width = vid.offsetWidth > width ? width : vid.offsetWidth;
		// calc the final height based on the ratio
		const final_height = final_width * 0.5625;

		// create the player
		player = YouTubePlayer(vid, {
			videoId: code,
			width: final_width,
			height: final_height,
			playerVars: {
				autoplay: autoplay ? 1 : 0,
				controls: controls ? 1 : 0,
				modestbranding: 1,
				rel: 0,
				fs: 1,
				iv_load_policy: 3,
				disablekb: keyboard ? 0 : 1,
				enablejsapi: 1,
				loop: loop ? 1 : 0,
				origin: window.location.origin
			}
		});

		player.on('ready', (e: any) => {
			player.getDuration().then((duration: number) => {
				onduration && onduration(duration);
			});
		});

		player.on('stateChange', (e: any) => {
			switch (e.data) {
				case 0:
					onended && onended(e);
					break;
				case 1:
					onplay && onplay(e);
					break;
				case 2:
					onpause && onpause(e);
					break;
			}
		});

		setInterval(() => {
			player.getCurrentTime().then((time: number) => {
				if (Math.abs(time - lastTime) > updateDelta) {
					ontimeupdate && ontimeupdate(time);
					lastTime = time;
				}
			});
		}, 1000);
	});
</script>

<div bind:this={vid} {id} style="width: 100%" />
