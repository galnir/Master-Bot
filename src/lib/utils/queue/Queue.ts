import type { GuildMember } from 'discord.js';
/*
  Based on @melike2d's work on @lavaclient/queue
*/

import { Song } from './Song';
import {
  DiscordResource,
  getId,
  NodeEvents,
  Player,
  Snowflake
} from 'lavaclient';
import { mayStartNext, Track } from '@lavaclient/types';
import { TypedEmitter } from 'tiny-typed-emitter';
import type { MessageChannel } from '../../..';
export enum LoopType {
  None,
  Queue,
  Song
}

export type Addable = string | Track | Song;

export interface QueueEvents {
  trackStart: (song: Song) => void;
  trackEnd: (song: Song) => void;
  finish: () => void;
}

export interface Loop {
  type: LoopType;
  current: number;
  max: number;
}

export interface AddOptions {
  requester?: Snowflake | DiscordResource;
  userInfo?: GuildMember;
  added?: number;
  next?: boolean;
}

export class Queue extends TypedEmitter<QueueEvents> {
  tracks: Song[] = [];
  previous: Song[] = [];
  loop: Loop = { type: LoopType.None, current: 0, max: -1 };
  last: Song | null = null;
  current: Song | null = null;
  data: Record<string, any> = {};
  channel: MessageChannel = null;

  constructor(readonly player: Player) {
    super();

    player.on('trackStart', () => {
      if (!this.current) return;

      if (this.loop.type === LoopType.Song && this.current === this.last) {
        this.loop.current++;
      }

      this.emit('trackStart', this.current);
    });

    player.on('trackEnd', (_, reason) => {
      if (!mayStartNext[reason]) return;
      this.last = this.current;

      if (this.current) {
        switch (this.loop.type) {
          case LoopType.Song:
            return this.player.play(this.current, {});
          case LoopType.Queue:
            this.previous.push(this.current);
            break;
        }

        this.emit('trackEnd', this.current);
      }

      if (!this.tracks.length) {
        this.tracks = this.previous;
        this.previous = [];
      }

      return this.next();
    });
  }

  async skip(): Promise<Song | null> {
    await this.player.stop();
    return this.current;
  }

  async start(): Promise<boolean> {
    return this.next();
  }

  async next(): Promise<boolean> {
    const next = this.tracks.shift();
    if (!next) {
      this.emit('finish');
      return false;
    }

    this.current = next;
    await this.player.play(next, {});
    return true;
  }

  clear(): void {
    this.tracks.length = 0;
  }

  remove(song: Song): Song | null;

  remove(index: number): Song | null;

  remove(song: Song | number): Song | null {
    if (typeof song === 'number') {
      if (song < 0 || song >= this.tracks.length) {
        // value will be used in 'remove' command instead of an error thrown from here
        return null;
      }

      return this.tracks.splice(song, 1)[0] ?? null;
    }

    const index = this.tracks.indexOf(song);
    if (index !== -1) {
      // again, will be handled in 'remove' command
      return null;
    }

    return this.tracks.splice(index, 1)[0] ?? null;
  }

  override emit<U extends keyof QueueEvents>(
    event: U,
    ...args: Parameters<QueueEvents[U]>
  ): boolean {
    // @ts-ignore
    const _event: keyof NodeEvents = event === 'finish' ? 'queueFinish' : event;
    // @ts-expect-error
    this.player.node.emit(_event, this, ...args);
    return super.emit(event, ...args);
  }

  add(songs: Addable | Array<Addable>, options: AddOptions = {}): number {
    songs = Array.isArray(songs) ? songs : [songs];
    const requesterId = options.requester && getId(options.requester),
      user = options.userInfo,
      added = Date.now(),
      toAdd = songs.map(song =>
        song instanceof Song
          ? song
          : new Song(song, added, {
              avatar: user?.user.avatar,
              defaultAvatarURL: user?.user.defaultAvatarURL,
              id: requesterId,
              name: user?.nickname ?? user?.user.username
            })
      );

    this.tracks[options.next ? 'unshift' : 'push'](...toAdd);
    return this.tracks.length;
  }

  setLoop(type: LoopType, max = this.loop.max): Queue {
    this.loop.type = type;
    this.loop.max = max;
    return this;
  }

  sort(predicate?: (a: Song, b: Song) => number): Array<Song> {
    return this.tracks.sort(predicate);
  }

  set<T extends Record<string, any>>(data?: T): void;

  set<T>(key: string, value: T): void;

  set(p1: string | any, p2?: any): void {
    if (typeof p1 !== 'string') {
      this.data = p1;
      return;
    }

    if (p2 != null) {
      this.data[p1] = p2;
      return;
    }
  }

  get<T extends Record<string, any>>(): T;

  get<T>(key: string): T | null;

  get(key?: string | any): any {
    return key ? this.data[key] : this.data;
  }
}
