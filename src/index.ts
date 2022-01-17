import '@lavaclient/queue/register';
import '@lavaclient/queue';
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

client.on('ready', () => {
  client.music.connect(client.user!.id);
});

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

declare module '@lavaclient/queue' {
  interface Queue {
    channel: MessageChannel;
  }
}

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

client.login(data.token);
