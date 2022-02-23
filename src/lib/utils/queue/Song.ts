import { decode } from '@lavalink/encoding';

import type { Track, TrackInfo } from '@lavaclient/types';

export class Song implements TrackInfo {
  readonly track: string;
  readonly requester?: string;

  length: number;
  identifier: string;
  author: string;
  isStream: boolean;
  position: number;
  title: string;
  uri: string;
  isSeekable: boolean;
  sourceName: string;

  constructor(track: string | Track, requester?: string) {
    this.track = typeof track === 'string' ? track : track.track;
    this.requester = requester;

    // TODO: make this less shitty
    if (typeof track !== 'string') {
      this.length = track.info.length;
      this.identifier = track.info.identifier;
      this.author = track.info.author;
      this.isStream = track.info.isStream;
      this.position = track.info.position;
      this.title = track.info.title;
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
      this.title = decoded.title;
      this.uri = decoded.uri!;
      this.isSeekable = !decoded.isStream;
      this.sourceName = decoded.source!;
    }
  }
}
