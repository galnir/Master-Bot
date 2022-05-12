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
  name: 'resume',
  description: 'Resume the music',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class PauseCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    if (!player!.paused) {
      return await interaction.reply('The track is not paused!');
    }

    await player?.resume();

    clearTimeout(client.leaveTimers[player?.guildId!]);
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

    return await interaction.reply('Track resumed playing');
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
