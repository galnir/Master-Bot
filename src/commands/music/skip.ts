import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Song } from '@lavaclient/queue';
import { LoopType } from '@lavaclient/queue';

@ApplyOptions<CommandOptions>({
  name: 'skip',
  description: 'Skip the current song playing',
  preconditions: ['inVoiceChannel', 'playerIsPlaying', 'inPlayerVoiceChannel']
})
export class SkipCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    if (player?.queue.loop.type == LoopType.Song) {
      player.queue.tracks.unshift(player.queue.current as Song);
    }
    await player?.queue.next();
    return await interaction.reply('Skipped track');
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
