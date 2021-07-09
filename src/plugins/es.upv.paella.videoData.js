import {
    PopUpButtonPlugin,
    createElementWithHtmlText
} from 'paella-core';

//import videoDataIcon from "";

export default class VideoDataPlugin extends PopUpButtonPlugin {
    async getContent() {
        const content = createElementWithHtmlText('<p>Video data</p>');
        return content;
    }

    get popUpType() {
        return "modal";
    }

    async load() {
        //this.icon = videoDataIcon;
    }
}