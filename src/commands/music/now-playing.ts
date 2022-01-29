import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import { NowPlayingEmbed } from '../../lib/music/NowPlayingEmbed';
import type { Song } from '../../lib/queue/Song';

@ApplyOptions<CommandOptions>({
  name: 'now-playing',
  description: 'Display an embed detailing the song playing',
  preconditions: ['inVoiceChannel', 'playerIsPlaying', 'inPlayerVoiceChannel']
})
export class NowPlayingCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    const NowPlaying = new NowPlayingEmbed(
      player?.queue.current as Song,
      player?.accuratePosition,
      player?.queue.current!.length as number
    );

    return await interaction.reply({ embeds: [NowPlaying.NowPlayingEmbed()] });
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
