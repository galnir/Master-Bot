import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import * as data from './config.json';
import type { Queue } from './lib/queue/Queue';
import type { Song } from './lib/queue/Song';
import { ExtendedClient } from './structures/ExtendedClient';

load({
  client: {
    id: data.spotify_client_id,
    secret: data.spotify_client_secret
  },
  autoResolveYoutubeTracks: true
});

const client = new ExtendedClient();

client.on('ready', () => {
  client.music.connect(client.user!.id);
});

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

declare module 'lavaclient' {
  interface Player {
    readonly queue: Queue;
  }

  interface ClusterEvents {
    nodeQueueCreate: (node: ClusterNode, queue: Queue) => void;
    nodeQueueFinish: (node: ClusterNode, queue: Queue) => void;
    nodeTrackStart: (node: ClusterNode, queue: Queue, song: Song) => void;
    nodeTrackEnd: (node: ClusterNode, queue: Queue, song: Song) => void;
  }

  interface NodeEvents {
    queueCreate: (queue: Queue) => void;
    queueFinish: (queue: Queue) => void;
    trackStart: (queue: Queue, song: Song) => void;
    trackEnd: (queue: Queue, song: Song) => void;
  }
}

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

client.login(data.token);
