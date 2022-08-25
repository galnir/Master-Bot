import type { Song } from '../lib/utils/queue/Song';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongSkipNotify'
})
export class MusicSongSkipNotifyListener extends Listener {
  public override async run(
    interaction: CommandInteraction,
    track: Song
  ): Promise<void> {
    if (!track) return;
    await interaction.reply({ content: `${track.title} has been skipped.` });
  }
}
