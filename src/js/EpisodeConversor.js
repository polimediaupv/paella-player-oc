import { Data } from "paella-core";

const g_contentTypes = {
    "presentation/delivery": "presentation",
    "presenter/delivery": "presenter"
};

const g_streamTypes = [
    {
        enabled: true,
        streamType: 'mp4',
        conditions: {
            mimetype: "video/mp4"
        },
        getSourceData: (track) => {
            const src = track.url;
            const mimetype = track.mimetype;
            const resolution = track.video?.resolution || "1x1";
            const resData = /(\d+)x(\d+)/.exec(resolution);
            const res = {
                w: 0,
                h: 0
            }

            if (resData) {
                res.w = resData[1];
                res.h = resData[2];
            }

            return { src, mimetype, res }
        }
    },
    {
        enabled: true,
        streamType: "hls",
        conditions: {
            mimetype: "application/x-mpegURL",
            live: false
        },
        getSourceData: (track) => {
            const src = track.url;
            const mimetype = track.mimetype;
            return { src, mimetype }
        }
    },
    {
        enabled: true,
        streamType: "hlsLive",
        conditions: {
            mimetype: "application/x-mpegURL",
            live: true
        },
        getSourceData: (track) => {
            const src = track.url;
            const mimetype = track.mimetype;
            return { src, mimetype }
        }
    }
];

function getStreamType(track) {
    const result = g_streamTypes.find(typeData => {
        let match = typeData.enabled;
        for (const condition in typeData.conditions) {
            if (!match) {
                break;
            }
            const value = typeData.conditions[condition];
            match = match && track[condition] == value;
        }
        return match;
    })
    return result;
}

function getSourceData(track) {
    let data = null;
    const type = g_contentTypes[track.type];
    if (type) {
        const streamType = getStreamType(track);
        if (streamType) {
            data = {
                source: streamType.getSourceData(track),
                type: streamType.streamType,
                content: type
            }
        }
    }
    return data;
}

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

    const sources = [];

    track.forEach(track => {
        const sourceData = getSourceData(track);
        sourceData && sources.push(sourceData);
    });

    // TODO: group source data
    console.log(sources);

    return sources;
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
