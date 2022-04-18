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
  description: 'Remove a track from the queue',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class RemoveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const player = client.music.players.get(interaction.guild!.id);

    if (position < 1 || position > player!.queue.tracks.length) {
      return interaction.reply('Please enter a valid position number!');
    }

    player!.queue.tracks.splice(position - 1, 1);
    return await interaction.reply(
      `:wastebasket: Removed song number ${position} from queue!`
    );
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'position',
          description:
            'What is the position of the song you want to remove from the queue?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
  }
}
