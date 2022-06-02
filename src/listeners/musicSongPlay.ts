import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Addable, Queue } from '../lib/utils/queue/Queue';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlay'
})
export class MusicSongPlayListener extends Listener {
  public override async run({
    queue,
    track
  }: {
    queue: Queue;
    track: Addable;
  }): Promise<void> {
    const channel = await queue.getTextChannel();
    if (channel) queue.client.emit('musicSongPlayMessage', channel, track);
  }
}
