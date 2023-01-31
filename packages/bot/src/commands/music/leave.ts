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
  description: 'Faz o bot sair do canal de voz e parar a música!',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class LeaveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const queue = client.music.queues.get(interaction.guildId!);

    await queue.leave();

    await interaction.reply({ content: 'Saiu do canal de voz.' });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
