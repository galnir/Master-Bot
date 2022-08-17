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
  name: 'nightcore',
  description: 'Enable/Disable Nightcore filter',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class NightcoreCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(
      interaction.guild!.id
    ) as Player<Node>;

    player.filters.timescale = (player.nightcore = !player.nightcore)
      ? { speed: 1.125, pitch: 1.125, rate: 1 }
      : undefined;

    await player.setFilters();
    return await interaction.reply(
      `Nightcore ${player.nightcore ? 'enabled' : 'disabled'}`
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
