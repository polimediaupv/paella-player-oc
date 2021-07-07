import { KeyShortcutPlugin, KeyCodes } from "paella-core";

export default class OpencastKeyShortcuts extends KeyShortcutPlugin {
    async getKeys() {
        return [
            {
                keyCode: KeyCodes.KeyM,
                description: "Mute audio",
                action: async event => {
                    await this.player.videoContainer?.setVolume(0);
                }
            },
            {
                keyCode: KeyCodes.KeyP,
                description: "Toggle play pause",
                action: async event => {
                    const paused = await this.player.paused();
                    if (paused) {
                        await this.player.play();
                    }
                    else {
                        await this.player.pause();
                    }
                }
            },
            {
                keyCode: KeyCodes.KeyS,
                description: "Pause video",
                action: async event => {
                    await this.player.pause();
                }
            },
            {
                keyCode: KeyCodes.KeyU,
                description: "Increment audio volume",
                action: async event => {
                    const vol = await this.player.videoContainer?.volume();
                    if (vol) {
                        await this.player.videoContainer?.setVolume(
                            Math.max(Math.min(vol + 0.1,1),0.1)
                        )
                    }
                }
            },
            {
                keyCode: KeyCodes.KeyD,
                description: "Decrement audio volume",
                action: async event => {
                    const vol = await this.player.videoContainer?.volume();
                    if (vol) {
                        await this.player.videoContainer?.setVolume(
                            Math.max(vol - 0.1,0)
                        )
                    }
                }
            }
        ]
    }
}