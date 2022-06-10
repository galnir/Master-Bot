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
  name: 'bassboost',
  description: 'Boost the bass of the playing track',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class BassboostCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(
      interaction.guild!.id
    ) as Player<Node>;

    player.filters.equalizer = (player.bassboost = !player.bassboost)
      ? [
          { band: 0, gain: 0.55 },
          { band: 1, gain: 0.45 },
          { band: 2, gain: 0.4 },
          { band: 3, gain: 0.3 },
          { band: 4, gain: 0.15 },
          { band: 5, gain: 0 },
          { band: 6, gain: 0 }
        ]
      : undefined;

    await player.setFilters();
    return await interaction.reply(
      `Bassboost ${player.bassboost ? 'enabled' : 'disabled'}`
    );
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
