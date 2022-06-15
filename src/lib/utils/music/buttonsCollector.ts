import type { Message, MessageComponentInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Queue } from '../queue/Queue';
import { NowPlayingEmbed } from './NowPlayingEmbed';
import type { Song } from '../queue/Song';

export default async function buttonsCollector(message: Message, song: Song) {
  const { client } = container;

  const queue = client.music.queues.get(message.guildId!);
  const channel = await queue.getTextChannel();

  const collector = message.createMessageComponentCollector();
  if (!channel) return;

  const maxLimit = 1.8e6; // 30 minutes
  let timer: NodeJS.Timer;

  collector.on('collect', async (i: MessageComponentInteraction) => {
    if (!message.member?.voice.channel?.members.has(i.user.id))
      return await i.reply({
        content: `:x: Only available to members in ${message.member?.voice.channel} <-- Click To Join`,
        ephemeral: true
      });

    let paused;

    if (i.customId === 'playPause') {
      clearTimeout(timer);

      if (queue.paused) {
        await queue.resume();
        paused = false;
        clearTimeout(client.leaveTimers[queue.guildID]!);
      } else {
        client.leaveTimers[queue.guildID] = setTimeout(async () => {
          channel.send(':zzz: Leaving due to inactivity');
          await queue.leave();
        }, maxLimit);

        timer = setTimeout(async () => {
          await queue.leave();
          await queue.clear();
        }, maxLimit);

        await queue.pause();
        paused = true;
      }
      const tracks = await queue.tracks();
      const NowPlaying = new NowPlayingEmbed(
        song,
        queue.player.accuratePosition,
        queue.player.trackData?.length ?? 0,
        await queue.getVolume(),
        tracks,
        tracks.at(-1),
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
      await queue.leave();
      clearTimeout(timer);
    }
    if (i.customId === 'next') {
      await i.update('Skipping');
      await queue.next({ skipped: true });
      clearTimeout(timer);
    }
    if (i.customId === 'volumeUp') {
      const currentVolume = await queue.getVolume();
      const volume = currentVolume + 10 > 200 ? 200 : currentVolume + 10;
      await queue.setVolume(volume);
      const tracks = await queue.tracks();
      const NowPlaying = new NowPlayingEmbed(
        song,
        queue.player.accuratePosition,
        queue.player.trackData?.length ?? 0,
        await queue.getVolume(),
        tracks,
        tracks.at(-1),
        paused
      );

      collector.empty();
      await i.update({
        embeds: [NowPlaying.NowPlayingEmbed()]
      });
    }
    if (i.customId === 'volumeDown') {
      const currentVolume = await queue.getVolume();
      const volume = currentVolume - 10 < 0 ? 0 : currentVolume - 10;
      await queue.setVolume(volume);
      const tracks = await queue.tracks();
      const NowPlaying = new NowPlayingEmbed(
        song,
        queue.player.accuratePosition,
        queue.player.trackData?.length ?? 0,
        await queue.getVolume(),
        tracks,
        tracks.at(-1),
        paused
      );
      collector.empty();
      await i.update({ embeds: [NowPlaying.NowPlayingEmbed()] });
    }
  });

  collector.on('end', async () => {
    clearTimeout(timer);
  });

  return collector;
}

export async function deletePlayerEmbed(queue: Queue) {
  const embedID = await queue.getEmbed();
  if (embedID) {
    const channel = await queue.getTextChannel();
    await channel?.messages.fetch(embedID).then(async oldMessage => {
      if (oldMessage)
        await oldMessage
          .delete()
          .catch(error => console.log('Failed to Delete Old Message.', error));
      await queue.deleteEmbed();
    });
  }
}
