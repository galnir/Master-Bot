import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener, ListenerOptions } from '@sapphire/framework';
import { manageStageChannel } from '../lib/utils/music/channelHandler';
import type { Queue } from '../lib/utils/queue/Queue';
import type { Song } from '../lib/utils/queue/Song';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlay'
})
export class MusicSongPlayListener extends Listener {
  public override async run(queue: Queue, track: Song): Promise<void> {
    const channel = await queue.getTextChannel();
    if (channel) {
      const { client } = container;

      clearTimeout(client.leaveTimers[queue.player.guildId]);
      delete client.leaveTimers[queue.player.guildId];
      // Leave Voice Channel when attempting to stream to an empty channel
      if (channel?.guild.me?.voice.channel?.members.size == 1) {
        await queue.leave();
        return;
      }
      queue.client.emit('musicSongPlayMessage', channel, track);
      await manageStageChannel(
        queue.guild.me?.voice.channel!,
        queue.guild.me!,
        queue
      );
    }
  }
}
