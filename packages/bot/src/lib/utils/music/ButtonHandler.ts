import type { Song } from '../queue/Song';
import { container } from '@sapphire/framework';
import type { Queue } from '../queue/Queue';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import buttonsCollector, { deletePlayerEmbed } from './buttonsCollector';

export async function embedButtons(
  embed: MessageEmbed,
  queue: Queue,
  song: Song,
  message?: string
) {
  await deletePlayerEmbed(queue);

  const { client } = container;
  const tracks = await queue.tracks();
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
      .setDisabled(!tracks.length ? true : false),
    new MessageButton()
      .setCustomId('volumeUp')
      .setLabel('Vol+')
      .setStyle('PRIMARY'),
    new MessageButton()
      .setCustomId('volumeDown')
      .setLabel('Vol-')
      .setStyle('PRIMARY')
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
