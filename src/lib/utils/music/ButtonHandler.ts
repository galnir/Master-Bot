import type { Song } from './../queue/Song';
import { NowPlayingEmbed } from './NowPlayingEmbed';
import { container } from '@sapphire/framework';
import type { Queue } from './../queue/Queue';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js';
import prisma from '../../prisma';

export async function embedButtons(
  embed: MessageEmbed,
  queue: Queue,
  song: Song
) {
  const { client } = container;
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('playPause')
      .setLabel('Play/Pause')
      .setStyle('PRIMARY'),
    new MessageButton().setCustomId('stop').setLabel('Stop').setStyle('DANGER'),
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
      embeds: [embed],
      components: [row]
    })
    .then(async (message: Message) => {
      const player = client.music.players.get(message.guild!.id);
      const maxLimit = 1.8e6; // 30 minutes

      let timeLimit: number | undefined =
        player?.queue.current?.length! > maxLimit
          ? maxLimit
          : player?.queue.current?.length;
      player?.queue.current?.isStream == true ? (timeLimit = maxLimit) : null;
      const filter = (message: any) =>
        message.member?.voice.channel?.id === player?.channelId; // only available to members in the same voice channel

      const collector = message.createMessageComponentCollector({
        filter,
        time: timeLimit
      });

      let timer: NodeJS.Timer = setTimeout(async () => {
        await message.delete().catch(error => {
          console.log(error);
        });
      }, timeLimit);

      if (player) {
        try {
          collector.on('collect', async (i: MessageComponentInteraction) => {
            let paused;
            if (i.customId === 'playPause') {
              clearTimeout(timer);
              timeLimit =
                player.queue.current!.length > maxLimit
                  ? maxLimit
                  : player.queue.current!.length - player.accuratePosition!;
              player.queue.current!.isStream == true
                ? (timeLimit = maxLimit)
                : null;

              if (player.paused) {
                player.resume();
                paused = false;
                clearTimeout(client.leaveTimers[player.guildId]!);

                timer = setTimeout(async () => {
                  await message.delete().catch(error => {
                    console.log(error);
                  });
                }, timeLimit);
                collector.resetTimer({ time: timeLimit });
              } else {
                client.leaveTimers[player.guildId] = setTimeout(() => {
                  player.queue.channel!.send(':zzz: Leaving due to inactivity');
                  player.disconnect();
                  player.node.destroyPlayer(player.guildId);
                }, maxLimit);

                timer = setTimeout(async () => {
                  await message.delete().catch(error => {
                    console.log(error);
                  });
                }, maxLimit);

                collector.resetTimer({ time: maxLimit });
                player.pause();
                paused = true;
              }
              const NowPlaying = new NowPlayingEmbed(
                song,
                player.accuratePosition,
                player.queue.current!.length,
                player.volume,
                player.queue.tracks!,
                player.queue.last!,
                paused
              );
              timer;
              collector.empty();
              await i.update({
                embeds: [NowPlaying.NowPlayingEmbed()]
              });
            }
            if (i.customId === 'stop') {
              await i.update('Leaving');
              player?.disconnect();
              client.music.destroyPlayer(player.guildId);
              clearTimeout(timer);
              collector.stop();
              await message.delete();
            }
            if (i.customId === 'next') {
              await i.update('Skipping');
              player.queue.next();
              clearTimeout(timer);
              collector.stop();
              await message.delete();
            }
            if (i.customId === 'volumeUp') {
              const volume =
                player.volume + 10 > 200 ? 200 : player.volume + 10;
              await player.setVolume(volume);
              const NowPlaying = new NowPlayingEmbed(
                song,
                player.accuratePosition,
                player.queue.current!.length,
                player.volume,
                player.queue.tracks!,
                player.queue.last!,
                paused
              );
              collector.empty();
              await prisma.guild.upsert({
                where: { id: message.guild!.id },
                create: {
                  id: message.guild!.id,
                  volume: volume
                },
                update: { volume: volume }
              });
              await i.update({
                embeds: [NowPlaying.NowPlayingEmbed()]
              });
            }
            if (i.customId === 'volumeDown') {
              const volume = player.volume - 10 < 0 ? 0 : player.volume - 10;
              await player.setVolume(volume);
              const NowPlaying = new NowPlayingEmbed(
                song,
                player.accuratePosition,
                player.queue.current!.length,
                player.volume,
                player.queue.tracks!,
                player.queue.last!,
                paused
              );
              collector.empty();
              await prisma.guild.upsert({
                where: { id: message.guild!.id },
                create: {
                  id: message.guild!.id,
                  volume: volume
                },
                update: { volume: volume }
              });
              await i.update({ embeds: [NowPlaying.NowPlayingEmbed()] });
            }
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        await message.delete();
      }
      timer;
    });
}
