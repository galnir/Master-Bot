import { mayStartNext } from '@lavaclient/types';
import type { Player } from 'lavaclient';
import { TypedEmitter } from 'tiny-typed-emitter';
import type { MessageChannel } from '../..';
import type { Addable } from '../queue/Queue';
import { Song } from '../queue/Song';
import { container, SapphireClient } from '@sapphire/framework';

export interface TriviaQueueEvents {
  triviaTrackStart: (queue: TriviaQueue) => void;
  triviaTrackEnd: (song: Song) => void;
  triviaEnd: (score: TriviaScore) => void;
}

export interface TriviaTrack {
  title: string;
  url: string;
  singers: string[];
}

export type TriviaScore = Map<string, number>;

export class TriviaQueue extends TypedEmitter<TriviaQueueEvents> {
  tracks: Song[] = [];
  trackAnswers: TriviaTrack[] = [];
  currentTrackAnswers: TriviaTrack | null = null;
  score: TriviaScore = new Map();
  current: Song | null = null;
  playing: boolean = false;
  channel: MessageChannel = null;
  wasTriviaEndCalled: boolean = false;
  client: SapphireClient = container.client;

  constructor(readonly player: Player) {
    super();

    player.on('trackEnd', (_, reason) => {
      if (this.current) {
        if (!mayStartNext[reason]) return;

        this.emit('triviaTrackEnd', this.current as Song);
      }
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
      this.client.emit('triviaEnd', this);
      return false;
    }

    const currentTrackAnswers = this.trackAnswers.shift();
    this.currentTrackAnswers = currentTrackAnswers as TriviaTrack;

    this.current = next;
    this.client.emit('triviaTrackStart', this);
    await this.player.play(next, {});
    return true;
  }

  clear(): void {
    this.tracks.length = 0;
  }

  add(songs: Addable | Array<Addable>): number {
    songs = Array.isArray(songs) ? songs : [songs];
    const toAdd = songs.map(song =>
      song instanceof Song ? song : new Song(song)
    );
    this.tracks.push(...toAdd);
    return this.tracks.length;
  }

  setScore(user_id: string, score: number): void {
    this.score.set(user_id, score);
  }

  getScore(user_id: string): number {
    return this.score.get(user_id) as number;
  }

  setTriviaSongs(songs: TriviaTrack[]): void {
    this.trackAnswers = songs;
  }
}
