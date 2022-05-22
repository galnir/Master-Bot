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
  song: Song,
  message?: string
) {
  await deletePlayerEmbed(queue);

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
      .setStyle('PRIMARY')
      .setDisabled(!queue.tracks?.length ? true : false),
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
      components: [row],
      content: message
    })
    .then(async (message: Message) => {
      const player = client.music.players.get(message.guild!.id);
      const maxLimit = 1.8e6; // 30 minutes
      client.playerEmbeds[message.guildId ?? message.guild!.id] = message.id;

      const collector = message.createMessageComponentCollector();

      let timer: NodeJS.Timer; // still needed for Pause

      if (player) {
        try {
          collector.on('collect', async (i: MessageComponentInteraction) => {
            if (!message.member?.voice.channel?.members.has(i.user.id))
              return await i.reply({
                content:
                  ':x: only available to members in the same voice channel',
                ephemeral: true
              });

            let paused;

            if (i.customId === 'playPause') {
              clearTimeout(timer);

              if (player.paused) {
                player.resume();
                paused = false;
                clearTimeout(client.leaveTimers[player.guildId]!);
              } else {
                client.leaveTimers[player.guildId] = setTimeout(() => {
                  player.queue.channel!.send(':zzz: Leaving due to inactivity');
                  player.disconnect();
                  player.node.destroyPlayer(player.guildId);
                }, maxLimit);

                timer = setTimeout(async () => {
                  await deletePlayerEmbed(player.queue);
                }, maxLimit);

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
              await deletePlayerEmbed(player.queue);
              player?.disconnect();
              client.music.destroyPlayer(player.guildId);
              clearTimeout(timer);
            }
            if (i.customId === 'next') {
              await i.update('Skipping');
              player.queue.next();
              clearTimeout(timer);
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

          collector.on('end', async () => {
            clearTimeout(timer);
          });
        } catch (e) {
          console.log(e);
        }
      }
    });
}
export async function deletePlayerEmbed(player: Queue) {
  const { client } = container;
  if (client.playerEmbeds[player?.player.guildId]) {
    await player
      .channel!.fetch(true)
      .then(
        async channel =>
          await channel.messages.fetch(
            client.playerEmbeds[player?.player.guildId!]
          )
      )
      .then(async oldMessage => {
        if (oldMessage)
          await oldMessage
            .delete()
            .catch(error =>
              console.log('Failed to Delete Old Message.', error)
            );
        delete client.playerEmbeds[player?.player.guildId!];
      });
  }
}
