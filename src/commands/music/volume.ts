import { NowPlayingEmbed } from './../../lib/utils/music/NowPlayingEmbed';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Node, Player } from 'lavaclient';
import prisma from '../../lib/prisma';
import { embedButtons } from '../../lib/utils/music/ButtonHandler';

@ApplyOptions<CommandOptions>({
  name: 'volume',
  description: 'Set the Volume',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class VolumeCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const query = interaction.options.getNumber('setting', true);

    const player = client.music.players.get(
      interaction.guild!.id
    ) as Player<Node>; // safe to cast thanks to 'playerIsPlaying' precondition

    if (query > 200 || query < 0) {
      return await interaction.reply(
        ':x: Please try again, value must be between 0 and 200.'
      );
    }

    if (interaction.guild) {
      await prisma.guild.upsert({
        where: {
          id: interaction.guild!.id || interaction.guildId!
        },
        update: { volume: query },
        create: {
          id: interaction.guild!.id || interaction.guildId!,
          volume: query
        }
      });
    } else {
      return await interaction.reply(':x: Error - Failed to gather Guild info');
    }

    await player.setVolume(query);

    const NowPlaying = new NowPlayingEmbed(
      player?.queue.current!,
      player?.accuratePosition,
      player?.queue.current?.length as number,
      player?.volume!,
      player?.queue.tracks!,
      player?.queue.last!,
      player?.paused
    );

    await embedButtons(
      NowPlaying.NowPlayingEmbed(),
      player?.queue!,
      player?.queue.current!
    );
    const vol = query;
    let volumeIcon: string = ':speaker:';
    if (vol > 50) volumeIcon = ':loud_sound:';
    if (vol <= 50 && vol > 20) volumeIcon = ':sound:';
    return await interaction.reply(
      `Volume is now set to ${query}% ${volumeIcon}`
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
          name: 'setting',
          description: 'What Volume? (0 to 200)',
          type: 'NUMBER',
          required: true
        }
      ]
    });
  }
}
