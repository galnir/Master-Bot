import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import { manageStageChannel } from '../lib/utils/music/channelHandler';
import type { Song } from '../lib/utils/queue/Song';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlayMessage'
})
export class MusicSongPlayMessageListener extends Listener {
  public override async run(channel: TextChannel, track: Song): Promise<void> {
    const { client } = container;
    const queue = client.music.queues.get(channel.guild.id);

    await manageStageChannel(
      channel.guild.me?.voice.channel!,
      channel.guild.me!,
      queue
    );
    // Leave Voice Channel when attempting to stream to an empty channel
    if (channel.guild.me?.voice.channel?.members.size == 1) {
      await queue.leave();
      return;
    }
    await channel.send({ content: `Now playing: ${track.title}` });
  }
}
