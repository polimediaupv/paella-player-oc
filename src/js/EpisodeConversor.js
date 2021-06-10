import { Data } from "paella-core";

function getMetadata(episode) {
    const { duration, title } = episode.mediapackage;
    
    // TODO: preview image

    const result = {
        title,
        duration: duration / 1000
    };

    return result;
}

function getStreams(episode) {
    const { track } = episode.mediapackage?.media;

    const result = [];

    track.forEach(track => {
        console.log(track);
    })

    return result;
}

function getFrameList(episode) {
    const result = null;

    return result;
}

function getCaptions(episode) {
    const result = null;

    return result;
}

export function episodeToManifest(ocResponse) {
    const searchResults = ocResponse['search-results'];
    if (searchResults?.total === 1) {
        const episode = searchResults.result; 
        const metadata = getMetadata(episode);
        const streams = getStreams(episode);
        const frameList = getFrameList(episode);
        const captions = getCaptions(episode);
    
        const result = {
            metadata,
            streams,
            frameList,
            captions
        };
   
        console.log(result);

        return result;
    }
    else {
        console.error(ocResponse);
        throw Error("Malformed episode data.");
    }

}

export default class EpisodeConversor {
    constructor(episodeJson) {
        this._data = episodeToManifest(episodeJson);
    }

    get data() {
        return this._data;
    }
}
