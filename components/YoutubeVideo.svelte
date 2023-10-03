<script lang="ts">
	import { mkid } from '$liwe3/utils/utils';
	import { onMount, createEventDispatcher } from 'svelte';
	import YouTubePlayer from 'youtube-player';

	export let url: string = 'https://www.youtube.com/watch?v=mbQa2VWcFiI';

	/** Whether to start playback of the video automatically. This feature might not work on all devices. */
	export let autoplay: boolean = false;
	/** Whether to display the player's interactive elements, including the play bar and sharing buttons. Set this option to false for a chromeless experience. To control playback when the play/pause button is hidden, set autoplay to true, use keyboard controls (which remain active), or implement our player SDK. */
	export let controls: boolean = true;
	/** Whether to enable keyboard input to trigger player events. This setting doesn't affect tab control. */
	export let keyboard: boolean = true;

	/** Setting of 1 causes the player to play the initial video again and again. */
	export let loop: boolean = false;

	/** Delta (in seconds) to fire a timeupdate event. */
	export let updateDelta: number = 1;

	export let width: number = 640;
	export let height: number = 360;

	let vid: HTMLDivElement;
	let id: string = mkid('vid');
	let player: any;
	let lastTime: number = 0;

	const dispatch = createEventDispatcher();

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
				dispatch('duration', duration);
			});
		});

		player.on('stateChange', (e: any) => {
			switch (e.data) {
				case 0:
					dispatch('ended', e);
					break;
				case 1:
					dispatch('play', e);
					break;
				case 2:
					dispatch('pause', e);
					break;
			}
		});

		setInterval(() => {
			player.getCurrentTime().then((time: number) => {
				if (Math.abs(time - lastTime) > updateDelta) {
					dispatch('timeupdate', time);
					lastTime = time;
				}
			});
		}, 1000);
	});
</script>

<div bind:this={vid} {id} style="width: 100%" />
