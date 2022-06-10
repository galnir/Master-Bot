import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Queue } from '../lib/utils/queue/Queue';

@ApplyOptions<ListenerOptions>({
  name: 'musicFinish'
})
export class MusicFinishListener extends Listener {
  public override async run(queue: Queue): Promise<void> {
    const channel = await queue.getTextChannel();
    if (channel) queue.client.emit('musicFinishNotify', channel);

    await queue.leave();
    await queue.clear();
  }
}
