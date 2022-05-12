import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

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
      return await interaction.reply('The track is already on pause!');
    }

    player?.pause();
    const maxLimit = 1.8e6; // 30 minutes
    client.leaveTimers[player?.guildId!] = setTimeout(() => {
      player?.queue.channel!.send(':zzz: Leaving due to inactivity');
      player?.disconnect();
      player?.node.destroyPlayer(player.guildId);
    }, maxLimit);

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
