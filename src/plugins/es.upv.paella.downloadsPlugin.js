import {
    createElementWithHtmlText,
    PopUpButtonPlugin,
    translate
} from 'paella-core';

import '../css/DownloadsPlugin.css';

import DownloadIcon from '../icons/download.svg';

export default class DownloadsPlugin extends PopUpButtonPlugin {
    async load() {
        this.icon = DownloadIcon;

        const { streams } = this.player.videoManifest;
        this._downloads = [];

        streams.forEach(s => {
            const { mp4 } = s.sources;
            if (mp4) {
                mp4.forEach(v => {
                    this._downloads.push({
                        id: `${ s.content }_${v.res.w}_${v.res.h}`,
                        src: v.src
                    })
                })
            }
        });
    }

    async getContent() {
        const container = createElementWithHtmlText(`
        <div class="downloads-plugin">
            <h4>${ translate('Available downloads') }
        </div>`);
        const list = createElementWithHtmlText(`<ul></ul>`, container);

        this._downloads.forEach(d => {
            createElementWithHtmlText(`
                <li><a href="${d.src}" target="_blank">${d.id}</a></li>
            `, list)
        })

        return container;
    }
}