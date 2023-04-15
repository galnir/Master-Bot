import type { Song } from '../queue/Song';
import { container } from '@sapphire/framework';
import type { Queue } from '../queue/Queue';
import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} from 'discord.js';
import buttonsCollector, { deletePlayerEmbed } from './buttonsCollector';

export async function embedButtons(
  embed: EmbedBuilder,
  queue: Queue,
  song: Song,
  message?: string
) {
  await deletePlayerEmbed(queue);

  const { client } = container;
  const tracks = await queue.tracks();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('playPause')
      .setLabel('Play/Pause')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('stop')
      .setLabel('Stop')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!tracks.length ? true : false),
    new ButtonBuilder()
      .setCustomId('volumeUp')
      .setLabel('Vol+')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('volumeDown')
      .setLabel('Vol-')
      .setStyle(ButtonStyle.Primary)
  );

  const channel = await queue.getTextChannel();
  if (!channel) return;

  return await channel
    .send({
      embeds: [embed],
      components: [row],
      content: message
    })
    .then(async (message: Message) => {
      const queue = client.music.queues.get(message.guild!.id);
      await queue.setEmbed(message.id);

      if (queue.player) {
        await buttonsCollector(message, song);
      }
    });
}
