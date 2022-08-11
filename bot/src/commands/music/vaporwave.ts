import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Node, Player } from 'lavaclient';

@ApplyOptions<CommandOptions>({
  name: 'vaporwave',
  description: 'Apply vaporwave on the playing track!',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class VaporWaveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(
      interaction.guild!.id
    ) as Player<Node>;

    player.filters = (player.vaporwave = !player.vaporwave)
      ? {
          ...player.filters,
          equalizer: [
            { band: 1, gain: 0.7 },
            { band: 0, gain: 0.6 }
          ],
          timescale: { pitch: 0.7, speed: 1, rate: 1 },
          tremolo: { depth: 0.6, frequency: 14 }
        }
      : {
          ...player.filters,
          equalizer: undefined,
          timescale: undefined,
          tremolo: undefined
        };

    await player.setFilters();
    return await interaction.reply(
      `Vaporwave ${player.vaporwave ? 'enabled' : 'disabled'}`
    );
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
