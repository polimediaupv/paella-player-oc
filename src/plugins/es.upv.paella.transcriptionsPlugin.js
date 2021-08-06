import {
    PopUpButtonPlugin,
    createElementWithHtmlText,
    translate,
    utils
} from 'paella-core';

import '../css/TranscriptionsPlugin.css'

import TranscriptionsIcon from '../icons/transcriptions.svg';

export default class TranscriptionsPlugin extends PopUpButtonPlugin {

    rebuildList(search = "") {
        const { videoContainer } = this.player;
        this._transcriptionsContainer.innerHTML = "";
        this.transcriptions.forEach(t => {
            if (search !== "") {
                const searchExp = search.split(" ")
                    .map(s => `(?:${s})`)
                    .join("|");
                const re = new RegExp(searchExp, "i");
                if (!re.test(t.text)) {
                    return;
                }
            }
            const id = `transcriptionItem${t.index}`;
            const transcriptionItem = createElementWithHtmlText(`
                <li>
                    <img id="${id}" src="${t.preview}" alt="${t.text}"/>
                    <span><strong>${utils.secondsToTime(t.time / 1000)}:</strong> ${t.text}</span>
                </li>`, 
            this._transcriptionsContainer);
            transcriptionItem.addEventListener('click', async evt => {
                const trimmingOffset = videoContainer.isTrimEnabled ? videoContainer.trimStart : 0;
                this.player.videoContainer.setCurrentTime(trimmingOffset + t.time / 1000);
                evt.stopPropagation();
            });
        });
    }

    async getContent() {
        
        const container = createElementWithHtmlText(`<div class="transcriptions-container"></div>`);
        const searchContainer = createElementWithHtmlText(`
        <input type="search" placeholder="${translate("Search")}"></input>`, container);
        searchContainer.addEventListener("click", evt => evt.stopPropagation());
        searchContainer.addEventListener("keyup", evt => {
            //console.log(evt.target.value);
            // TODO: Implement search
            this.rebuildList(evt.target.value);
        });
        const transcriptionsContainer = createElementWithHtmlText(`
        <ul class="transcriptions-list"></ul>`, container);
        this._transcriptionsContainer = transcriptionsContainer;
        this.rebuildList();
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