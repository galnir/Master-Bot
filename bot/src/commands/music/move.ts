import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'move',
  description: 'Move a track to a different position in queue',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class MoveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const currentPosition = interaction.options.getInteger(
      'current-position',
      true
    );
    const newPosition = interaction.options.getInteger('new-position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (
      currentPosition < 1 ||
      currentPosition > length ||
      newPosition < 1 ||
      newPosition > length ||
      currentPosition == newPosition
    ) {
      return await interaction.reply(
        ':x: Please enter valid position numbers!'
      );
    }

    await queue.moveTracks(currentPosition - 1, newPosition - 1);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'current-position',
          description: 'What is the position of the song you want to move?',
          type: 'INTEGER',
          required: true
        },
        {
          name: 'new-position',
          description: 'What is the position you want to move the song to?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
  }
}
