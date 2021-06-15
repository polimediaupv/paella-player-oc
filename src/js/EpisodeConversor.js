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
    
    const result = {
        title,
        duration: duration / 1000
    };

    return result;
}

function mergeSources(sources) {
    const streams = [];
    sources.forEach(sourceData => {
        const { content, type, source } = sourceData;
        let stream = streams.find(s => s.content === content);
        if (!stream) {
            stream = {
                sources: {},
                content: content
            }
            // TODO: Determine wich stream is the main audio
            if (content === 'presenter') {
                stream.role = "mainAudio";
            }
            
            streams.push(stream);
        }

        stream.sources[type] = stream.sources[type] || [];
        stream.sources[type].push(source);
    });

    return streams;
}

function getStreams(episode) {
    let { track } = episode.mediapackage?.media;
    if (!Array.isArray(track)) {
        track = [track];
    }

    const sources = [];

    track.forEach(track => {
        const sourceData = getSourceData(track);
        sourceData && sources.push(sourceData);
    });

    return mergeSources(sources);
}

function processAttachments(episode, manifest) {
    const { attachments } = episode.mediapackage;
    const previewImages = [];
    let videoPreview = null;

    let attachment = attachments?.attachment || [];
    if (!Array.isArray(attachment)) {
        attachment = [attachment];
    }

    attachment.forEach(att => {
        const timeRE = /time=T(\d+):(\d+):(\d+)/.exec(att.ref);
        if (att.type === 'presentation/segment+preview' && timeRE) {
            const h = Number(timeRE[1]) * 60 * 60;
            const m = Number(timeRE[2]) * 60;
            const s = timeRE[3];
            const t = (h + m + s) / 100;
            previewImages.push({
                mimetype: att.mimetype,
                url: att.url,
                thumb: att.url,
                id: `frame_${t}`,
                time: t
            });
        }
        else if (att.type === 'presenter/player+preview') {
            // presenter preview
            videoPreview = att.url;
        }
        else if (att.type === 'presentation/player+preview' && videoPreview === null) {
            // presentation preview
            videoPreview = att.url;
        }
    });

    if (previewImages.length>0) {
        manifest.frameList = previewImages;
    }

    if (videoPreview) {
        manifest.metadata = manifest.metadata || {};
        manifest.metadata.preview = videoPreview;
    }
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
        
        const result = {
            metadata,
            streams
        };

        processAttachments(episode, result);
   
        console.log(result);

        return result;
    }
    else {
        console.error(ocResponse);
        return null;
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
