import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Queue } from '../lib/utils/queue/Queue';
import type { Song } from '../lib/utils/queue/Song';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlay'
})
export class MusicSongPlayListener extends Listener {
  public override async run(queue: Queue, track: Song): Promise<void> {
    const channel = await queue.getTextChannel();
    if (channel) queue.client.emit('musicSongPlayMessage', channel, track);
  }
}
