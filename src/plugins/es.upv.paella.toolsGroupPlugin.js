import { ButtonGroupPlugin } from 'paella-core';

import MenuIcon from '../icons/menu-icon.svg';

export default class ToolsGroupPlugin extends ButtonGroupPlugin {
    async load() {
        this.icon = MenuIcon;
    }
}