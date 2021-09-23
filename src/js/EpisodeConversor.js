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

function getStreamType(track,config) {
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

function getSourceData(track, config) {
    let data = null;
    const contentTypes = config.contentTypes || g_contentTypes;
    const type = contentTypes[track.type];
    if (type) {
        const streamType = getStreamType(track, config);
        if (streamType) {
            data = {
                source: streamType.getSourceData(track, config),
                type: streamType.streamType,
                content: type
            }
        }
    }
    return data;
}

function getMetadata(episode, config) {
    const { duration, title, language, series, seriestitle } = episode.mediapackage;
    const date = new Date(episode.dcCreated);
    const creators = (Array.isArray(episode.mediapackage?.creators) ? 
        episode.mediapackage?.creators : 
        [episode.mediapackage?.creators])
            .map(creator => creator.creator);

    const result = {
        title,
        duration: duration / 1000,
        creators,
        language,
        series,
        seriestitle,
        date
    };


    return result;
}

function mergeSources(sources, config) {
    const streams = [];
    sources.forEach(sourceData => {
        const { content, type, source } = sourceData;
        let stream = streams.find(s => s.content === content);
        if (!stream) {
            stream = {
                sources: {},
                content: content
            }

            if (content === config.mainAudioContent) {
                stream.role = "mainAudio";
            }
            
            streams.push(stream);
        }

        stream.sources[type] = stream.sources[type] || [];
        stream.sources[type].push(source);
    });

    return streams;
}

function getStreams(episode, config) {
    let { track } = episode.mediapackage?.media;
    if (!Array.isArray(track)) {
        track = [track];
    }

    const sources = [];

    track.forEach(track => {
        const sourceData = getSourceData(track, config);
        sourceData && sources.push(sourceData);
    });

    return mergeSources(sources, config);
}

function processSegments(episode, manifest, config) {
    const { segments } = episode;
    if (segments) {
        manifest.transcriptions = manifest.transcriptions || [];
        segments.segment.forEach(({ index, previews, text, time, duration}) => { 
            manifest.transcriptions.push({
                index,
                preview: previews?.preview?.$,
                text,
                time,
                duration
            });
        });
    }
}

export function getVideoPreview(mediapackage, config) {
    const { attachments } = mediapackage;
    let videoPreview = null;

    let attachment = attachments?.attachment || [];
    if (!Array.isArray(attachment)) {
        attachment = [attachment];
    }

    const videoPreviewAttachments = config.videoPreviewAttachments || [
        "presenter/player+preview",
        "presentation/player+preview"
    ];
    attachment.forEach(att => {
        videoPreviewAttachments.some(validAttachment => {
            if (validAttachment === att.type) {
                videoPreview = att.url;
            }
            return videoPreview !== null;
        })
    });

    return videoPreview;
}

function processAttachments(episode, manifest, config) {
    const { attachments } = episode.mediapackage;
    const previewImages = [];
    let videoPreview = null;

    let attachment = attachments?.attachment || [];
    if (!Array.isArray(attachment)) {
        attachment = [attachment];
    }

    const previewAttachment = config.previewAttachment || 'presentation/segment+preview';
    const videoPreviewAttachments = config.videoPreviewAttachments || [
        "presenter/player+preview",
        "presentation/player+preview"
    ];
    attachment.forEach(att => {
        const timeRE = /time=T(\d+):(\d+):(\d+)/.exec(att.ref);
        if (att.type === previewAttachment && timeRE) {
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
        else {
            videoPreviewAttachments.some(validAttachment => {
                if (validAttachment === att.type) {
                    videoPreview = att.url;
                }
                return videoPreview !== null;
            })
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

function getCaptions(episode, config) {
    const result = [];
    let attachments = episode.mediapackage?.attachments?.attachment;
    if (!(attachments instanceof Array)) { 
        attachments = attachments ? [attachments] : []; 
    }
    

    attachments.forEach(att => {
        const exp = /captions\/([a-z\d]+)(?:\+([a-z]+))?/.exec(att.type);
        if (exp) {
            const format = exp[1];
            const lang = exp[2] || "";
            result.push({
                id: att.id,
                lang: lang,
                text: lang || "Unknown language",
                format: format,
                url:att.url
            });
        }
    });

    let catalogs = episode.mediapackage?.metadata?.catalog;
    if (!(catalogs instanceof Array)) {
        catalogs = catalogs ? [catalogs] : []; 
    }

    catalogs.forEach((currentCatalog) => {
        try {
          // backwards compatibility:
          // Catalogs flavored as 'captions/timedtext' are assumed to be dfxp
          if (currentCatalog.type == 'captions/timedtext') {
            let captions_lang;
  
            if (currentCatalog.tags && currentCatalog.tags.tag) {
              if (!(currentCatalog.tags.tag instanceof Array)) {
                currentCatalog.tags.tag = [currentCatalog.tags.tag];
              }
              currentCatalog.tags.tag.forEach((tag)=>{
                if (tag.startsWith('lang:')){
                  let split = tag.split(':');
                  captions_lang = split[1];
                }
              });
            }
  
            let captions_label = captions_lang || 'unknown language';
            result.push({
              id: currentCatalog.id,
              lang: captions_lang,
              text: captions_label,
              url: currentCatalog.url,
              format: 'dfxp'
            });
          }
        }
        catch (err) {/**/}
      });
    
    return result;
}

export function episodeToManifest(ocResponse, config) {
    const searchResults = ocResponse['search-results'];
    if (searchResults?.total === 1) {
        const episode = searchResults.result; 
        const metadata = getMetadata(episode, config);
        const streams = getStreams(episode, config);
        const captions = getCaptions(episode, config);
        
        const result = {
            metadata,
            streams,
            captions
        };

        processAttachments(episode, result, config);
        processSegments(episode, result, config);



        return result;
    }
    else {
        console.error(ocResponse);
        return null;
    }

}

export default class EpisodeConversor {
    constructor(episodeJson, config = {}) {
        this._data = episodeToManifest(episodeJson, config);
    }

    get data() {
        return this._data;
    }
}
