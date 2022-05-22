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
  name: 'loop',
  description: 'Loop the playing song or queue',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class LoopCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const option = interaction.options.getString('loop-type', true);

    const player = client.music.players.get(interaction.guild!.id);

    if (!player) return;
    switch (player.queue.loop.type) {
      case LoopType.None: // None (loop not enabled)
        if (option == 'queue') {
          if (!player?.queue.tracks.length) {
            await interaction.reply(':x: There are no tracks in queue!');
            break;
          }
          player.queue.setLoop(LoopType.Queue);
          await interaction.reply('The entire queue is now playing on loop');
          break;
        }
        player.queue.setLoop(LoopType.Song);
        await interaction.reply(
          `**${player.queue.current!.title}** is now playing on loop`
        );
        break;
      case LoopType.Queue: // Queue
        if (option == 'queue') {
          player.queue.setLoop(LoopType.None);
          await interaction.reply('The queue is no longer playing on loop');
          break;
        }
        interaction.reply(
          'The current song is not on loop, the queue is. If you want to stop the queue from looping, use this command again and pick the queue option'
        );
        break;
      case LoopType.Song: // Song
        if (option == 'queue') {
          interaction.reply(
            'The queue is not on loop, the playing song is. If you want to stop the queue from looping, use this command again and pick the queue option'
          );
          break;
        }
        player.queue.setLoop(LoopType.None);
        await interaction.reply(
          `**${player.queue.current!.title}** is no longer playing on loop`
        );
    }
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'loop-type',
          description:
            'Do you want to loop the playing track or loop the entire queue?',
          type: 'STRING',
          required: true,
          choices: [
            {
              name: 'Song',
              value: 'song'
            },
            {
              name: 'Queue',
              value: 'queue'
            }
          ]
        }
      ]
    });
  }
}
