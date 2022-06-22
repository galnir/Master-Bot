import { Time } from '@sapphire/time-utilities';
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

  const maxLimit = Time.Minute * 2;
  let timer: NodeJS.Timer;

  let updateBar: NodeJS.Timer;
  const updateTick = song.isSeekable
    ? Math.floor(song.length / 22)
    : 60 * Time.Second;

  const tracks = await queue.tracks();
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
        embeds: [await NowPlaying.NowPlayingEmbed()]
      });
    } catch (error) {
      clearInterval(updateBar);
    }
  }, updateTick);

  collector.on('collect', async (i: MessageComponentInteraction) => {
    if (!message.member?.voice.channel?.members.has(i.user.id))
      return await i.reply({
        content: `:x: Only available to members in ${message.member?.voice.channel} <-- Click To Join`,
        ephemeral: true
      });

    if (i.customId === 'playPause') {
      if (queue.paused) {
        await queue.resume();
        clearTimeout(client.leaveTimers[queue.guildID]!);
      } else {
        client.leaveTimers[queue.guildID] = setTimeout(async () => {
          await channel.send(':zzz: Leaving due to inactivity');
          await queue.leave();
          clearInterval(updateBar);
        }, maxLimit);
        await queue.pause();
      }

      const tracks = await queue.tracks();
      const NowPlaying = new NowPlayingEmbed(
        song,
        queue.player.accuratePosition,
        queue.player.trackData?.length ?? 0,
        queue.player.volume,
        tracks,
        tracks.at(-1),
        queue.player.paused
      );
      collector.empty();
      return await i.update({
        embeds: [await NowPlaying.NowPlayingEmbed()]
      });
    }
    if (i.customId === 'stop') {
      clearTimeout(timer);
      clearInterval(updateBar);
      await queue.leave();
      return;
    }
    if (i.customId === 'next') {
      clearTimeout(timer);
      clearInterval(updateBar);
      await queue.next({ skipped: true });
      return;
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
        queue.player.volume,
        tracks,
        tracks.at(-1),
        queue.player.paused
      );
      collector.empty();
      await i.update({
        embeds: [await NowPlaying.NowPlayingEmbed()]
      });
      return;
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
        queue.player.volume,
        tracks,
        tracks.at(-1),
        queue.player.paused
      );
      collector.empty();
      await i.update({ embeds: [await NowPlaying.NowPlayingEmbed()] });
      return;
    }
  });

  collector.on('end', async () => {
    clearTimeout(timer);
    clearInterval(updateBar);
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
