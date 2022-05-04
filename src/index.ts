import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { Player } from 'lavaclient';
import * as data from './config.json';
import prisma from './lib/prisma';
import { Queue } from './lib/utils/queue/Queue';
import type { Song } from './lib/utils/queue/Song';
import { TriviaQueue } from './lib/utils/trivia/TriviaQueue';
import { notify } from './lib/utils/twitch/notifyChannel';
import { ExtendedClient } from './structures/ExtendedClient';

load({
  client: {
    id: data.spotify_client_id,
    secret: data.spotify_client_secret
  },
  autoResolveYoutubeTracks: true
});

const client = new ExtendedClient();

client.on('ready', async () => {
  client.music.connect(client.user!.id);
  client.user?.setActivity('/', {
    type: 'WATCHING'
  });
  client.user?.setStatus('online');
  const token = client.twitch.auth.access_token;
  if (!token) return;
  const notifyDB = await prisma.twitchNotify.findMany();

  const query: string[] = [];
  for (const user of notifyDB) {
    query.push(user.twitchId);
    client.twitch.notifyList[user.twitchId] = {
      sendTo: user.channelIds,
      logo: user.logo,
      live: user.live,
      messageSent: false
    };
  }
  await notify(query).then(() =>
    setInterval(() => {
      const newQuery: string[] = [];
      // pickup newly added entries
      for (const key in client.twitch.notifyList) {
        newQuery.push(key);
      }
      notify(newQuery);
    }, 60 * 1000)
  );
});

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel | null;

declare module 'lavaclient' {
  interface Player {
    readonly queue: Queue;
    readonly triviaQueue: TriviaQueue;
    [_queue]: Queue;
    [_triviaQueue]: TriviaQueue;
    nightcore: boolean;
    vaporwave: boolean;
    karaoke: boolean;
    bassboost: boolean;
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

const _queue: unique symbol = Symbol.for('Player#queue');
const _triviaQueue: unique symbol = Symbol.for('Player#triviaQueue');
Reflect.defineProperty(Player.prototype, 'queue', {
  get(this: Player) {
    return (this[_queue] ??= new Queue(this));
  }
});
Reflect.defineProperty(Player.prototype, 'triviaQueue', {
  get(this: Player) {
    return (this[_triviaQueue] ??= new TriviaQueue(this));
  }
});

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

client.login(data.token);
