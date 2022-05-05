import { NowPlayingEmbed } from './../lib/utils/music/NowPlayingEmbed';
import { SapphireClient } from '@sapphire/framework';
import { Intents, MessageActionRow, MessageButton } from 'discord.js';
import { Node } from 'lavaclient';
import * as data from '../config.json';

export class ExtendedClient extends SapphireClient {
  readonly music: Node;
  leaveTimers: { [key: string]: NodeJS.Timer };

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
      ]
    });

    this.music = new Node({
      sendGatewayPayload: (id, payload) =>
        this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: data.lava_host,
        password: data.lava_pass,
        port: data.lava_port,
        secure: data.lava_secure
      }
    });

    this.ws.on('VOICE_SERVER_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });
    this.ws.on('VOICE_STATE_UPDATE', data => {
      this.music.handleVoiceUpdate(data);
    });

    this.leaveTimers = {};
    this.music.on('queueFinish', queue => {
      queue.player.stop();
      this.leaveTimers[queue.player.guildId as string] = setTimeout(() => {
        queue.channel!.send(':zzz: Leaving due to inactivity');
        queue.player.disconnect();
        queue.player.node.destroyPlayer(queue.player.guildId);
      }, 30 * 1000);
    });

    this.music.on('trackStart', async (queue, song) => {
      if (this.leaveTimers[queue.player.guildId]) {
        clearTimeout(this.leaveTimers[queue.player.guildId]!);
      }

      const NowPlaying = new NowPlayingEmbed(
        song,
        undefined,
        queue.current!.length as number,
        queue.player.volume,
        queue.tracks!,
        queue.last!,
        false
      );

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('playPause')
          .setLabel('Play/Pause')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('stop')
          .setLabel('Stop')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('volumeUp')
          .setLabel('Vol+')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('volumeDown')
          .setLabel('Vol-')
          .setStyle('PRIMARY')
      );
      return await queue
        .channel!.send({
          embeds: [NowPlaying.NowPlayingEmbed()],
          components: [row]
        })
        .then(async message => {
          const maxLimit: number = 1.8e6; // 30 minutes
          let timeLimit: number =
            queue.current!.length > maxLimit ? maxLimit : queue.current!.length;
          queue.current?.isStream == true ? (timeLimit = maxLimit) : null;
          const filter = (i: any) =>
            i.member.voice.channel?.id === queue.player.channelId; // only available to members in the same voice channel
          const collector = message.channel.createMessageComponentCollector({
            filter,
            time: timeLimit
          });
          const timer: NodeJS.Timer = setTimeout(async () => {
            await message.delete().catch(error => {
              console.log(error);
            });
          }, timeLimit);
          collector.on('collect', async i => {
            if (i.customId === 'playPause') {
              let paused;
              if (queue.player.paused) {
                queue.player.resume();
                paused = false;
              } else {
                queue.player.pause();
                paused = true;
              }
              const NowPlaying = new NowPlayingEmbed(
                song,
                undefined,
                queue.current!.length as number,
                queue.player.volume,
                queue.tracks!,
                queue.last!,
                paused
              );
              collector.empty();
              await i.update({
                embeds: [NowPlaying.NowPlayingEmbed()]
              });
            }
            if (i.customId === 'stop') {
              await i.update('Leaving');
              const player = this.music.players.get(message.guild!.id);
              player?.disconnect();
              this.music.destroyPlayer(player!.guildId);
              clearTimeout(timer);
              collector.stop();
              await message.delete();
            }
            if (i.customId === 'next') {
              await i.update('Skipping');
              queue.next();
              clearTimeout(timer);
              collector.stop();
              await message.delete();
            }
            if (i.customId === 'volumeUp') {
              const volume =
                queue.player.volume + 10 > 200 ? 200 : queue.player.volume + 10;
              await queue.player.setVolume(volume);
              const NowPlaying = new NowPlayingEmbed(
                song,
                undefined,
                queue.current!.length as number,
                volume,
                queue.tracks!,
                queue.last!,
                queue.player.paused
              );
              await i.update({
                embeds: [NowPlaying.NowPlayingEmbed()]
              });
            }
            if (i.customId === 'volumeDown') {
              const volume =
                queue.player.volume - 10 < 0 ? 0 : queue.player.volume - 10;
              await queue.player.setVolume(volume);
              const NowPlaying = new NowPlayingEmbed(
                song,
                undefined,
                queue.current!.length as number,
                volume,
                queue.tracks!,
                queue.last!,
                queue.player.paused
              );
              await i.update({ embeds: [NowPlaying.NowPlayingEmbed()] });
            }
          });
          timer;
        });
    });
  }
}

declare module '@sapphire/framework' {
  interface SapphireClient {
    readonly music: Node;
  }
}
