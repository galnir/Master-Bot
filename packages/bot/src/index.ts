import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import * as data from './config.json';
import buttonsCollector from './lib/utils/music/buttonsCollector';
import { ExtendedClient } from './structures/ExtendedClient';
import { notify } from './lib/utils/twitch/notifyChannel';
import Logger from './lib/utils/logger';
import { ErrorListeners } from './listeners/ErrorHandling';
import { trpcNode } from './trpc';

load({
  client: {
    id: data.spotify_client_id,
    secret: data.spotify_client_secret
  },
  autoResolveYoutubeTracks: true
});

const client = new ExtendedClient();

ErrorListeners();

client.on('ready', async () => {
  client.music.connect(client.user!.id);
  client.user?.setActivity('/', {
    type: 'WATCHING'
  });

  client.user?.setStatus('online');

  const token = client.twitch.auth.access_token;
  if (!token) return;

  // happens to be the first DB call at start up
  try {
    const notifyDB = await trpcNode.query('twitch.get-all');

    const query: string[] = [];
    for (const user of notifyDB.notifications) {
      query.push(user.twitchId);
      client.twitch.notifyList[user.twitchId] = {
        sendTo: user.channelIds,
        logo: user.logo,
        live: user.live,
        messageSent: user.sent,
        messageHandler: {}
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
  } catch (err) {
    Logger.error('Prisma ' + err);
  }

  client.guilds.cache.map(async guild => {
    const queue = client.music.queues.get(guild.id);

    // grab last known voice state of bot
    const voiceState = await guild.voiceStates.cache.find(
      user => user.id == client.application?.id
    );

    // update lavalink manually if the bot is still in voice chat after restart
    const customVoiceStateUpdate = {
      session_id: voiceState?.sessionId,
      channel_id: voiceState?.channel?.id,
      guild_id: voiceState?.guild.id,
      user_id: guild.me?.id
    };
    if (queue) {
      if (guild.me?.voice) {
        if (!customVoiceStateUpdate.channel_id) return;
        queue.createPlayer();
        queue.connect(customVoiceStateUpdate.channel_id);
        await queue.start();

        const song = await queue.getCurrentTrack();
        if (song) {
          const channel = guild.channels.cache.get(
            (await queue.getTextChannelID()) as string
          );
          // remake the message collector so buttons will work again after restart
          if (channel?.isText()) {
            const message = await channel.messages.fetch(
              (await queue.getEmbed()) as string
            );

            if (queue.player) {
              try {
                await buttonsCollector(message, song);
              } catch (e) {
                Logger.error(e);
              }
            }
          }
        }
      }
    }
  });
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
