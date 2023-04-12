import type { Song } from '../lib/utils/queue/Song';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongSkipNotify'
})
export class MusicSongSkipNotifyListener extends Listener {
  public override async run(
    interaction: ChatInputCommandInteraction,
    track: Song
  ): Promise<void> {
    if (!track) return;
    await interaction.reply({ content: `${track.title} has been skipped.` });
  }
}
