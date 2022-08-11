import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'skipto',
  description: 'Skip to a track in queue',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SkipToCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (position > length || position < 1) {
      return await interaction.reply(
        ':x: Please enter a valid track position.'
      );
    }

    await queue.skipTo(position);

    await interaction.reply(
      `:white_check_mark: Skipped to track number ${position}!`
    );
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
            'What is the position of the song you want to skip to in queue?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
  }
}
