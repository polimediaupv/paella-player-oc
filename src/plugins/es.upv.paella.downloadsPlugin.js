import {
    createElementWithHtmlText,
    PopUpButtonPlugin,
    translate
} from 'paella-core';

import DownloadIcon from '../icons/download.svg';

export default class DownloadsPlugin extends PopUpButtonPlugin {
    async load() {
        this.icon = DownloadIcon;
    }

    async getContent() {
        const container = createElementWithHtmlText(`
        <div class="downloads-plugin">
            <h4>${ translate('Available downloads') }
        </div>`);

        return container;
    }
}