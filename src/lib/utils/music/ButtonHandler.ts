import type { Song } from './../queue/Song';
import { container } from '@sapphire/framework';
import type { Queue } from './../queue/Queue';
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import buttonsCollector, { deletePlayerEmbed } from './buttonsCollector';
import { NowPlayingEmbed } from './NowPlayingEmbed';

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
        let updateBar: NodeJS.Timer;
        if (queue.player.trackData?.isSeekable) {
          updateBar = setInterval(async () => {
            if (!queue.player) return clearInterval(updateBar);
            const NowPlaying = new NowPlayingEmbed(
              song,
              queue.player.accuratePosition,
              queue.player.trackData?.length ?? 0,
              queue.player.volume,
              tracks,
              tracks.at(-1),
              queue.paused
            );
            try {
              await message.edit({
                embeds: [NowPlaying.NowPlayingEmbed()]
              });
            } catch (error) {
              // console.log(error);
              clearInterval(updateBar);
            }
          }, queue.player.trackData.length / 22 || 30 * 1000);
          updateBar;
        }

        await buttonsCollector(message, song);
      }
    });
}
