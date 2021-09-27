import { 
    createElementWithHtmlText,
    PopUpButtonPlugin,
    translate
} from 'paella-core';

import { getVideoPreview } from '../js/EpisodeConversor';

import ListIcon from '../icons/list.svg';

import '../css/EpisodesFromSeries.css';

export default class EpisodesFromSeriesPlugin extends PopUpButtonPlugin {

    async load() {
        this.icon = ListIcon;
    }

    async getContent() {
        const {
            series,
            seriestitle
        } = this.player.videoManifest.metadata;

        const container = createElementWithHtmlText(`
            <div class="episodes-from-series">
                <h4>${ translate('Videos in series') } ${ seriestitle }</h4>
            </div>
        `);
        const list = createElementWithHtmlText(`<ul></ul>`, container);

        const sid = series;
        const limit = this.config.maxCount || 5;
        const response = await fetch(`/search/episode.json?sid=${ sid }&limit=${limit}`);
        if (response.ok) {
            const responseData = await response.json();
            const result = responseData["search-results"].result;
            (Array.isArray(result) ? result : [result]).forEach(({id,dcTitle,mediapackage}) => {
                const preview = getVideoPreview(mediapackage,this.player.config);
                const url = `watch.html?id=${id}`;
                createElementWithHtmlText(`
                <li>
                    <a href="${url}">
                        <img src="${preview}" alt="${dcTitle}">
                        ${dcTitle}
                    </a>
                </li>
                `,list);
            });
        }
        return container;
    }
}
