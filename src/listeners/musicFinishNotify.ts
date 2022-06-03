import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'musicFinishNotify'
})
export class MusicFinishNotifyListener extends Listener {
  public override async run(channel: TextChannel): Promise<void> {
    await channel.send({ content: `No more tracks, I'm out!` });
  }
}
