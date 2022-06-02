import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import * as data from './config.json';
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
});

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel | null;

declare module 'lavaclient' {
  interface Player {
    nightcore: boolean;
    vaporwave: boolean;
    karaoke: boolean;
    bassboost: boolean;
  }
}

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

client.login(data.token);
