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
  name: 'karaoke',
  description: 'Turn the playing track to karaoke',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class KaraokeCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(
      interaction.guild!.id
    ) as Player<Node>;

    player.filters.karaoke = (player.karaoke = !player.karaoke)
      ? {
          level: 1,
          monoLevel: 1,
          filterBand: 220,
          filterWidth: 100
        }
      : undefined;

    await player.setFilters();
    return await interaction.reply(
      `Karaoke ${player.karaoke ? 'enabled' : 'disabled'}`
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
