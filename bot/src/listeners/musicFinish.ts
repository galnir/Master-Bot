import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions, container } from '@sapphire/framework';
import { deletePlayerEmbed } from '../lib/utils/music/buttonsCollector';
import type { Queue } from '../lib/utils/queue/Queue';
import { inactivityTime } from '../lib/utils/music/handleOptions';

@ApplyOptions<ListenerOptions>({
  name: 'musicFinish'
})
export class MusicFinishListener extends Listener {
  public override async run(queue: Queue): Promise<void> {
    const channel = await queue.getTextChannel();
    const { client } = container;
    await deletePlayerEmbed(queue);
    client.leaveTimers[queue.player.guildId] = setTimeout(async () => {
      if (channel) queue.client.emit('musicFinishNotify', channel);
      await queue.leave();
    }, inactivityTime());
  }
}
