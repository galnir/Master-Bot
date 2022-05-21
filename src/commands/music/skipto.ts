import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import { LoopType } from '../../lib/utils/queue/Queue';

@ApplyOptions<CommandOptions>({
  name: 'skipto',
  description: 'Skip to a track in queue',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SkipToCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const player = client.music.players.get(interaction.guild!.id);

    if (!player?.queue.tracks.length) {
      return await interaction.reply(':x: There are no tracks in queue!');
    }

    if (player.queue.loop.type == LoopType.Queue) {
      const slicedBefore = player.queue.tracks.slice(0, position - 1);
      const slicedAfter = player.queue.tracks.slice(position - 1);
      player.queue.tracks = slicedAfter.concat(slicedBefore);
    } else {
      player.queue.tracks.splice(0, position - 1);
      player.queue.setLoop(LoopType.None);
    }
    await player.queue.next();

    return await interaction.reply(
      `Skipped to **${player.queue.current!.title}**`
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
            'What is the position of the song you want to skip to in queue?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
  }
}
