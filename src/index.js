
import { addDictionary, Paella } from 'paella-core';
import getBasicPluginContext from 'paella-basic-plugins';
import getSlidePluginContext from 'paella-slide-plugins';
import getZoomPluginContext from 'paella-zoom-plugin';

import EpisodeConversor from './js/EpisodeConversor.js';

import DictionaryEs from './dictionary.es.json';

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

    getManifestUrl: (repoUrl,videoId,player) => {
        return `${repoUrl}?id=${videoId}`;
    },

    getManifestFileUrl: (manifestUrl, manifestFileName, player) => {
        return manifestUrl;
    },

    loadVideoManifest: async function (url, config, player) {
        const loadEpisode = async () => {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();    
                const conversor = new EpisodeConversor(data, config.opencast || {});
                return conversor.data;
            }
            else {
                throw Error("Invalid manifest url");
            }
        }

        const loadStats = async () => {
            const videoId = await this.getVideoId(config,player);
            const response = await fetch(`/usertracking/stats.json?id=${videoId}`);
            if (response.ok) {
                const data = await response.json();
                return data.stats;
            }
            else {
                null;
            }
        }

        const data = await loadEpisode();
        const stats = await loadStats();
        if (stats) {
            data.metadata.views = stats.views;
        }

        if (data === null) {
            player.log.info("Try to load me.json")
            // Check me.json, if the user is not logged in, redirect to login
            const data = await fetch('/info/me.json');
            const me = await data.json();

            if (me.userRole === "ROLE_USER_ANONYMOUS") {
                location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
            }
            else {
                // TODO: the video does not exist or the user can't see it
                alert("The video does not exist");
                return null;
            }
        }
        else {
            return data;
        }
    },

    loadDictionaries: player => {
        player.setLanguage("es");
        player.addDictionary('es', DictionaryEs);
    }
};

let paella = new Paella('player-container', initParams);

paella.loadManifest()
    .then(() => paella.log.info("Paella player load done"))
    .catch(e => paella.log.error(e));

