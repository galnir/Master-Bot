require('@lavaclient/queue/register');
import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
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

client.music.on('connect', () => {
  console.log('Lavalink is ready!');
});

client.music.on('trackStart', (queue, song) => {
  // @ts-ignore
  queue.channel.send(`Started playing **${song.title}**`);
});

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

client.login(data.token);
