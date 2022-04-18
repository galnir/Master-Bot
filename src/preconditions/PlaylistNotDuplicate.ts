import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'playlistNotDuplicate'
})
export class PlaylistNotDuplicate extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    let count;

    try {
      count = await prisma.playlist.count({
        where: {
          userId: guildMember.id,
          name: playlistName
        }
      });
    } catch (error) {
      console.error(error);
      return this.error({ message: 'Something went wrong!' });
    }

    return count > 0
      ? this.error({
          message: `There is already a playlist named **${playlistName}** in your saved playlists!`
        })
      : this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playlistNotDuplicate: never;
  }
}
