import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'pause',
  description: 'Pause the music',
  preconditions: ['inVoiceChannel', 'playerIsPlaying', 'inPlayerVoiceChannel']
})
export class PauseCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    if (player!.paused) {
      return await interaction.reply('The track is already on pause!');
    }

    player?.pause();
    return await interaction.reply('Track paused');
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
