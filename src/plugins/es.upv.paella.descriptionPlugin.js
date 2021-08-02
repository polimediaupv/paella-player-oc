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
        <div>
            <div class="showMHDescriptionTabBarLeft">
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Title')}: 
                    <span class="showMHDescriptionTabBarValue">${title}</span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Presenter')}:
                    <span class="showMHDescriptionTabBarValue">
                        <a href="/engage/ui/index.html?q=${presenter}">${presenter}</a>
                    </span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Series')}: 
                    <span class="showMHDescriptionTabBarValue">
                        <a href="/engage/ui/index.html?epFrom=${series}">${series}</a>
                    </span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Date')}:
                    <span class="showMHDescriptionTabBarValue">${date}</span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Views')}:
                    <span class="showMHDescriptionTabBarValue">${views}</span>
                </div>
            </div>
            <div class="showMHDescriptionTabBarRight">
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Collaborator')}:
                    <span class="showMHDescriptionTabBarValue">${collaborator}</span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Subject')}:
                    <span class="showMHDescriptionTabBarValue"></span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Language')}:
                    <span class="showMHDescriptionTabBarValue">${language}</span>
                </div>
                <div class="showMHDescriptionTabBarElement">
                    ${translate('Description')}: 
                    <span class="showMHDescriptionTabBarValue"></span>
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