import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
  name: 'musicSongPause'
})
export class MusicSongPauseListener extends Listener {
  public override async run(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: `Track paused.` });
  }
}
