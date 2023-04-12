import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPause'
})
export class MusicSongPauseListener extends Listener {
  public override async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply({ content: `Track paused.` });
    return;
  }
}
