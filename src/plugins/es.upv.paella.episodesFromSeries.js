import { 
    createElementWithHtmlText,
    PopUpButtonPlugin,
    translate
} from 'paella-core';

import ListIcon from '../icons/list.svg';

import '../css/EpisodesFromSeries.css';

export default class EpisodesFromSeriesPlugin extends PopUpButtonPlugin {

    async load() {
        this.icon = ListIcon;
    }

    async getContent() {
        const {
            series,
            seriesTitle
        } = this.player.videoManifest.metadata;

        const container = createElementWithHtmlText(`
            <div class="episodes-from-series">
                <h4>${ translate('Videos in series') } ${ seriesTitle }</h4>
                <ul>
                </ul>
            </div>
        `);

        const sid = series;
        const limit = this.config.maxCount || 5;
        const response = await fetch(`/search/episode.json?sid=${ sid }&limit=${limit}`);
        if (response.ok) {
            const responseData = await response.json();
            const result = responseData["search-results"].result;
            (Array.isArray(result) ? result : [result]).forEach(({id,dcTitle,mediapackage}) => {
                const url = `watch.html?id=${id}`;
                createElementWithHtmlText(`
                <li><a href="${url}">${dcTitle}</a></li>
                `,container);
            });
        }
        return container;
    }
}
