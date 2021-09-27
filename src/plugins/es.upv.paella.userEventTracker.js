import { Events, EventLogPlugin } from 'paella-core';

export default class UserEventTrackerPlugin extends EventLogPlugin {
	get events() {
		return [
			Events.PLAY,
			Events.PAUSE,
			Events.SEEK,
			Events.STOP,
			Events.ENDED,
			Events.FULLSCREEN_CHANGED,
			Events.VOLUME_CHANGED,
			Events.BUTTON_PRESS,
			Events.SHOW_POPUP,
			Events.HIDE_POPUP
		]
	}

	async onEvent(event, params) {
		const id = this.player.videoId;
		await this.player.data.write(
			'userTracking',
			{ id },
			{ event, params }
		);
	}
}
