
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
        
        const loadEpisode = async () => {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();    
                const conversor = new EpisodeConversor(data);
                return conversor.data;
            }
            else {
                throw Error("Invalid manifest url");
            }
        }

        const data = await loadEpisode();        
        if (data === null) {
            console.log("Try to load me.json")
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
    }
};

let paella = new Paella('player-container', initParams);

paella.loadManifest()
    .then(() => console.log("done"))
    .catch(e => console.error(e));

