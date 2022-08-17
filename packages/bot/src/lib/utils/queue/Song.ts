import { decode } from '@lavalink/encoding';
import type { Track, TrackInfo } from '@lavaclient/types/v3';
import * as MetadataFilter from 'metadata-filter';

export class Song implements TrackInfo {
  readonly track: string;
  requester?: RequesterInfo;
  length: number;
  identifier: string;
  author: string;
  isStream: boolean;
  position: number;
  title: string;
  uri: string;
  isSeekable: boolean;
  sourceName: string;
  thumbnail: string;
  added: number;

  constructor(
    track: string | Track,
    added?: number,
    requester?: RequesterInfo
  ) {
    this.track = typeof track === 'string' ? track : track.track;
    this.requester = requester;
    this.added = added ?? Date.now();
    const filterSet = {
      song: [
        MetadataFilter.removeVersion,
        MetadataFilter.removeRemastered,
        MetadataFilter.fixTrackSuffix,
        MetadataFilter.removeLive,
        MetadataFilter.youtube,
        MetadataFilter.normalizeFeature,
        MetadataFilter.removeVersion
      ]
    };
    const filter = MetadataFilter.createFilter(filterSet);

    // TODO: make this less shitty
    if (typeof track !== 'string') {
      this.length = track.info.length;
      this.identifier = track.info.identifier;
      this.author = track.info.author;
      this.isStream = track.info.isStream;
      this.position = track.info.position;
      this.title = filter.filterField('song', track.info.title);
      this.uri = track.info.uri;
      this.isSeekable = track.info.isSeekable;
      this.sourceName = track.info.sourceName;
    } else {
      const decoded = decode(this.track);
      this.length = Number(decoded.length);
      this.identifier = decoded.identifier;
      this.author = decoded.author;
      this.isStream = decoded.isStream;
      this.position = Number(decoded.position);
      this.title = filter.filterField('song', decoded.title);
      this.uri = decoded.uri!;
      this.isSeekable = !decoded.isStream;
      this.sourceName = decoded.source;
    }

    // Thumbnails
    switch (this.sourceName) {
      case 'soundcloud': {
        this.thumbnail =
          'https://a-v2.sndcdn.com/assets/images/sc-icons/fluid-b4e7a64b8b.png'; // SoundCloud Logo
        break;
      }

      case 'youtube': {
        this.thumbnail = `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`; // Track Thumbnail
        break;
      }
      case 'twitch': {
        this.thumbnail = 'https://i.imgur.com/nO3f4jq.png'; // large Twitch Logo
        break;
      }

      default: {
        this.thumbnail = 'https://cdn.discordapp.com/embed/avatars/1.png'; // Discord Default Avatar
        break;
      }
    }
  }
}

interface RequesterInfo {
  avatar?: string | null;
  defaultAvatarURL?: string;
  id?: string;
  name?: string;
}
