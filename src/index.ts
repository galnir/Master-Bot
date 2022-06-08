import { load } from '@lavaclient/spotify';
import {
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import type { VoiceStateUpdate } from 'lavaclient';
import * as data from './config.json';
import buttonsCollector from './lib/utils/music/buttonsCollector';
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
  client.guilds.cache.map(async guild => {
    const queue = client.music.queues.get(guild.id);

    // grab last known voice state of bot
    const voiceState = await guild.voiceStates.cache.find(
      user => user.id == client.application?.id
    );

    // update lavalink manually if the bot is still in voice chat after restart
    const customVoiceStateUpdate: VoiceStateUpdate = {
      session_id: voiceState?.sessionId!,
      channel_id: voiceState?.channel?.id! as `${bigint}`,
      guild_id: voiceState?.guild.id! as `${bigint}`,
      user_id: guild.me?.id as `${bigint}`
    };
    if (queue)
      if (guild.me?.voice) {
        queue.createPlayer();
        queue.connect(voiceState?.channel?.id!);
        await queue.player.handleVoiceUpdate(customVoiceStateUpdate);
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
                console.log(e);
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
