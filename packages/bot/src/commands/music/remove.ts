import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'remove',
  description: 'Remover uma música da fila',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class RemoveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (position < 1 || position > length) {
      return interaction.reply(':x: Por favor, insira um número de posição válido!');
    }

    await queue.removeAt(position - 1);
    return await interaction.reply({
      content: `Música removida na posição ${position}`
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'position',
          description:
            'Qual é a posição da música que você deseja remover da fila?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
  }
}
