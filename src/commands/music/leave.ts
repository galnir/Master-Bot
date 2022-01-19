import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'leave',
  description: 'Make the bot leave its voice channel and stop playing music',
  preconditions: ['inVoiceChannel', 'playerIsPlaying', 'inPlayerVoiceChannel']
})
export class LeaveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);
    player?.disconnect();
    client.music.destroyPlayer(player!.guildId);
    return await interaction.reply('Leaving voice channel');
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
