import {
    PopUpButtonPlugin,
    createElementWithHtmlText,
    translate,
    utils
} from 'paella-core';

import '../css/TranscriptionsPlugin.css'

import TranscriptionsIcon from '../icons/transcriptions.svg';

export default class TranscriptionsPlugin extends PopUpButtonPlugin {
    async getContent() {
        const { videoContainer } = this.player;
        const container = createElementWithHtmlText(`<div class="transcriptions-container"></div>`);
        const searchContainer = createElementWithHtmlText(`
        <input type="search" placeholder="${translate("Search")}"></input>`, container);
        searchContainer.addEventListener("click", evt => evt.stopPropagation());
        const transcriptionsContainer = createElementWithHtmlText(`
        <ul class="transcriptions-list"></ul>`, container);
        this.transcriptions.forEach(t => {
            const id = `transcriptionItem${t.index}`;
            const transcriptionItem = createElementWithHtmlText(`
                <li>
                    <img id="${id}" src="${t.preview}" alt="${t.text}"/>
                    <span><strong>${utils.secondsToTime(t.time / 1000)}:</strong> ${t.text}</span>
                </li>`, 
            transcriptionsContainer);
            transcriptionItem.addEventListener('click', async evt => {
                const trimmingOffset = videoContainer.isTrimEnabled ? videoContainer.trimStart : 0;
                this.player.videoContainer.setCurrentTime(trimmingOffset + t.time / 1000);
                evt.stopPropagation();
            });
        })
        return container;
    }

    get popUpType() {
        return "no-modal";
    }

    async isEnabled() {
        const enabled = await super.isEnabled();
        this.transcriptions = this.player.videoManifest.transcriptions;
        console.log(this.transcriptions);
        return enabled && this.transcriptions.length > 0;
    }

    async load() {
        this.icon = TranscriptionsIcon;
    }
}