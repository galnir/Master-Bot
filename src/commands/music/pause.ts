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
  name: 'pause',
  description: 'Pause the music',
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

    if (player!.paused) {
      return await interaction.reply(':x: The track is already on pause!');
    }

    await player?.pause();
    const maxLimit = 1.8e6; // 30 minutes
    client.leaveTimers[player?.guildId!] = setTimeout(() => {
      player?.queue.channel!.send(':zzz: Leaving due to inactivity');
      player?.disconnect();
      player?.node.destroyPlayer(player.guildId);
    }, maxLimit);

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

    return await interaction.reply('Track paused');
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
