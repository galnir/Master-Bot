import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'resume',
  description: 'Resume the music',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class PauseCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    if (!player!.paused) {
      return await interaction.reply('The track is not paused!');
    }

    player?.resume();
    return await interaction.reply('Track resumed playing');
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
