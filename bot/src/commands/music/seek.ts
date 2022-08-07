import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'seek',
  description: 'Seek to a desired point in a track',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SeekCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const seconds = interaction.options.getInteger('seconds', true);
    const milliseconds = seconds * 1000;

    const queue = client.music.queues.get(interaction.guildId!);
    const track = await queue.getCurrentTrack();
    if (!track)
      return await interaction.reply(':x: There is no track playing!'); // should never happen
    if (!track.isSeekable)
      return await interaction.reply(':x: This track is not seekable!');

    if (milliseconds > track.length || milliseconds < 0) {
      return await interaction.reply(':x: Please enter a valid number!');
    }

    const player = queue.player;
    await player.seek(milliseconds);

    return await interaction.reply(`Seeked to ${seconds} seconds`);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'seconds',
          type: 'INTEGER',
          description:
            'To what point in the track do you want to seek? (in seconds)',
          required: true
        }
      ]
    });
  }
}
