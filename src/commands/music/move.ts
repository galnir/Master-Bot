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
    'inVoiceChannel',
    'musicTriviaPlaying',
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

    const player = client.music.players.get(interaction.guild!.id);

    if (!player?.queue.tracks.length) {
      return await interaction.reply('There are no tracks in queue!');
    }

    if (
      currentPosition < 1 ||
      currentPosition > player.queue.tracks.length ||
      newPosition < 1 ||
      newPosition > player.queue.tracks.length ||
      currentPosition == newPosition
    ) {
      return interaction.reply('Please enter valid position numbers!');
    }

    const title = player.queue.tracks[currentPosition - 1].title;
    array_move(player.queue.tracks, currentPosition - 1, newPosition - 1);

    return await interaction.reply(
      `**${title}** moved to position ${newPosition}`
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
          name: 'current-position',
          description: 'What is the position of the song you want to move?',
          type: 'INTEGER',
          required: true
        },
        {
          name: 'new-position',
          description: 'What is the position you want to move the song to?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}

// https://stackoverflow.com/a/5306832/9421002
function array_move(arr: any[], old_index: number, new_index: number) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}
