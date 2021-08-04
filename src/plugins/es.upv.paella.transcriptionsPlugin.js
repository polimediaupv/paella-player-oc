import {
    PopUpButtonPlugin,
    createElementWithHtmlText,
    translate
} from 'paella-core';

import '../css/TranscriptionsPlugin.css'

import TranscriptionsIcon from '../icons/transcriptions.svg';

export default class TranscriptionsPlugin extends PopUpButtonPlugin {
    async getContent() {
        const container = createElementWithHtmlText(`
            <div class="transcriptions-container">Transcriptions</div>
        `);
        return container;
    }

    get popUpType() {
        return "no-modal";
    }

    async load() {
        this.icon = TranscriptionsIcon;
    }
}