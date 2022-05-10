import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import { NowPlayingEmbed } from '../../lib/utils/music/NowPlayingEmbed';
import type { Song } from '../../lib/utils/queue/Song';
import { embedButtons } from '../../lib/utils/music/ButtonHandler';

@ApplyOptions<CommandOptions>({
  name: 'now-playing',
  description: 'Display an embed detailing the song playing',
  preconditions: [
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class NowPlayingCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    const NowPlaying = new NowPlayingEmbed(
      player?.queue.current as Song,
      player?.accuratePosition,
      player?.queue.current?.length as number,
      player?.volume as number,
      player?.queue.tracks,
      player?.queue.last!,
      player?.paused
    );
    return interaction
      .reply({
        content: 'Getting Player Data...',
        fetchReply: true
      })
      .then(async () => {
        await interaction.deleteReply().catch(error => {
          console.log('Failed to Delete Reply', error);
        });
        await embedButtons(
          NowPlaying.NowPlayingEmbed(),
          player!.queue,
          player?.queue.current as Song
        );
      });
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
