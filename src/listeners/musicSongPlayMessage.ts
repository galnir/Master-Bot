import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannelType } from 'discord-api-types/v10';
import type { Addable } from '../lib/utils/queue/Queue';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlayMessage'
})
export class MusicSongPlayMessageListener extends Listener {
  public override async run({
    channel,
    track
  }: {
    channel: TextChannelType;
    track: Addable;
  }): Promise<void> {}
}
