import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'playlistExists'
})
export class PlaylistExists extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    const playlist = await prisma.playlist.findFirst({
      where: {
        name: playlistName,
        userId: guildMember.id
      }
    });

    return playlist
      ? this.ok()
      : this.error({
          message: `You have no playlist named **${playlistName}**`
        });
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playlistExists: never;
  }
}
