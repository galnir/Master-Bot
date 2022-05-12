import { NowPlayingEmbed } from './../../lib/utils/music/NowPlayingEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import {
  embedButtons,
  handlePlayerEmbed
} from '../../lib/utils/music/ButtonHandler';

@ApplyOptions<CommandOptions>({
  name: 'seek',
  description: 'Seek to a desired point in a track',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SeekCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const seconds = interaction.options.getInteger('seconds', true);

    const player = client.music.players.get(interaction.guild!.id);

    const milliseconds = seconds * 1000;
    if (milliseconds > player!.queue!.current!.length || milliseconds < 0) {
      return await interaction.reply('Please enter a valid number!');
    }

    await player?.seek(milliseconds);
    await handlePlayerEmbed(player?.queue!);
    const NowPlaying = new NowPlayingEmbed(
      player?.queue.current!,
      player?.accuratePosition,
      player?.queue.current?.length as number,
      player?.volume!,
      player?.queue.tracks!,
      player?.queue.last!,
      player?.paused
    );

    await embedButtons(
      NowPlaying.NowPlayingEmbed(),
      player?.queue!,
      player?.queue.current!
    );

    return await interaction.reply(`Seeked to ${seconds} seconds`);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
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
