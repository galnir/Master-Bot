import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'random',
  description: 'Generate a random number between two inputs!'
})
export class RandomCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const min = Math.ceil(interaction.options.getInteger('min', true));
    const max = Math.floor(interaction.options.getInteger('max', true));

    const rngEmbed = new MessageEmbed().setTitle(
      `${Math.floor(Math.random() * (max - min + 1)) + min}`
    );

    return await interaction.reply({ embeds: [rngEmbed] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'INTEGER',
          required: true,
          name: 'min',
          description: 'What is the minimum number?'
        },
        {
          type: 'INTEGER',
          required: true,
          name: 'max',
          description: 'What is the maximum number?'
        }
      ]
    });
  }
}
