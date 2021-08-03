import {
    PopUpButtonPlugin,
    createElementWithHtmlText,
    translate
} from 'paella-core';

import '../css/DescriptionPlugin.css';

import InfoIcon from '../icons/info.svg';

export default class DescriptionPlugin extends PopUpButtonPlugin {
    async getContent() {
        const {
            title,
            duration,
            creators,
            language,
            series,
            seriesTitle,
            date
        } = this.player.videoManifest.metadata;
        const views = 0;
        const presenter = creators[0] || "";
        const collaborator = creators[1] || "";

        const content = createElementWithHtmlText(`
        <div class="description-plugin">
            <div class="table-column">
                <div class="table-item">
                    ${translate('Title')}: 
                    <span class="item-value">${title}</span>
                </div>
                <div class="table-item">
                    ${translate('Presenter')}:
                    <span class="item-value">
                        <a href="/engage/ui/index.html?q=${presenter}">${presenter}</a>
                    </span>
                </div>
                <div class="table-item">
                    ${translate('Series')}: 
                    <span class="item-value">
                        <a href="/engage/ui/index.html?epFrom=${series}">${series}</a>
                    </span>
                </div>
                <div class="table-item">
                    ${translate('Date')}:
                    <span class="item-value">${(new Date(date)).toLocaleDateString()}</span>
                </div>
                <div class="table-item">
                    ${translate('Views')}:
                    <span class="item-value">${views}</span>
                </div>
            </div>
            <div class="table-column">
                <div class="table-item">
                    ${translate('Collaborator')}:
                    <span class="item-value">${collaborator}</span>
                </div>
                <div class="table-item">
                    ${translate('Subject')}:
                    <span class="item-value"></span>
                </div>
                <div class="table-item">
                    ${translate('Language')}:
                    <span class="item-value">${language}</span>
                </div>
                <div class="table-item">
                    ${translate('Description')}: 
                    <span class="item-value"></span>
                </div>
            </div>
        </div>
        `);

        return content;
    }

    get popUpType() {
        return 'no-modal';
    }

    async load() {
        this.icon = InfoIcon;
    }
}