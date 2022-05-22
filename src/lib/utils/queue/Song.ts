import { decode } from '@lavalink/encoding';
import type { Track, TrackInfo } from '@lavaclient/types';
import * as MetadataFilter from 'metadata-filter';

export class Song implements TrackInfo {
  readonly track: string;
  readonly requester?: RequesterInfo;
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
      this.thumbnail = `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`;
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
      this.sourceName = decoded.source!;
      this.thumbnail = `https://img.youtube.com/vi/${decoded.identifier}/hqdefault.jpg`;
    }
  }
}
interface RequesterInfo {
  avatar?: string | null;
  defaultAvatarURL?: string;
  id?: string;
  name?: string;
}
