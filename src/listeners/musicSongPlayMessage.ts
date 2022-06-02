import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { Song } from '../lib/utils/queue/Song';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPlayMessage'
})
export class MusicSongPlayMessageListener extends Listener {
  public override async run(channel: TextChannel, track: Song): Promise<void> {
    await channel.send({ content: `Now playing: ${track.title}` });
  }
}
