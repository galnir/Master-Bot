import { container } from '@sapphire/framework';
import type { Track } from '@lavaclient/types';
import type { Guild } from 'discord.js';
import type { Player } from 'lavaclient';
import type { QueueCollection } from './QueueCollection';

export enum LoopType {
  None,
  Queue,
  Track
}

interface Loop {
  type: LoopType;
}

export class Queue {
  public constructor(
    public readonly store: QueueCollection,
    public readonly guildId: string
  ) {}

  tracks: string[] | Track[] = [];
  history: Track[] = [];
  loop: Loop = { type: LoopType.None };
  previous: Track | null = null;
  nowPlaying: Track | null = null;

  public get player() {
    return this.store.client.players.get(this.guildId);
  }

  public get playing(): boolean {
    return this.player!.playing;
  }

  public get paused(): boolean {
    return this.player!.paused;
  }

  public get guild(): Guild {
    return container.client.guilds.cache.get(this.guildId) as Guild;
  }

  public get voiceChannelID(): string | null | undefined {
    return this.player?.channelId;
  }

  // Connect to the users VC
  public async connect(channelId: string): Promise<void> {
    if (!this.player) return;
    await this.player.connect(channelId, { deafened: true });
    this.player.channelId = channelId;
    this.player.emit('channelJoin', channelId);
  }

  public async createPlayer(): Promise<Player<any>> {
    return container.client.music.createPlayer(this.guildId);
  }

  public add(tracks: any): number {
    if (!tracks.length) return 0;

    this.tracks.push(...tracks);
    return this.tracks.length;
  }

  public async start() {
    return this.next();
  }

  public async next(): Promise<boolean> {
    const next = this.tracks.shift() as Track;
    if (!next) {
      // emit finish event
      this.player!.disconnect();
      await this.player!.destroy();
      return false;
    }
    if (!this.player) return false;
    console.log(this.player);
    await this.player.play(next);
    this.player.emit('trackStart', this.nowPlaying!.track);
    return true;
  }
}
