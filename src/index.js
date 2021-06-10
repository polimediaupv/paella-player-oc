
import { Paella } from 'paella-core';
import getBasicPluginContext from 'paella-basic-plugins';
import getSlidePluginContext from 'paella-slide-plugins';
import getZoomPluginContext from 'paella-zoom-plugin';

import EpisodeConversor from './js/EpisodeConversor.js';

const initParams = {
    customPluginContext: [
        require.context("./plugins", true, /\.js/),
        getBasicPluginContext(),
        getSlidePluginContext(),
        getZoomPluginContext()
    ],
    configResourcesUrl: '/paella/config/',
    configUrl: '/paella/config/config.json',

    repositoryUrl: '/search/episode.json',

    getManifestUrl: (repoUrl,videoId) => {
        return `${repoUrl}?id=${videoId}`;
    },

    getManifestFileUrl: (manifestUrl, manifestFileName) => {
        return manifestUrl;
    },

    loadVideoManifest: async (url) => {
        const response = await fetch(url);
        const data = await response.json();

        const conversor = new EpisodeConversor(data);
        
        return conversor.data;
    }
};

let paella = new Paella('player-container', initParams);

paella.loadManifest()
    .then(() => console.log("done"))
    .catch(e => console.error(e));

