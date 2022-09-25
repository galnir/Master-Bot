import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
  name: 'playlistNotDuplicate'
})
export class PlaylistNotDuplicate extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    try {
      const playlist = await trpcNode.playlist.getPlaylist.query({
        name: playlistName,
        userId: guildMember.id
      });

      if (playlist) throw new Error();
    } catch {
      return this.error({
        message: `There is already a playlist named **${playlistName}** in your saved playlists!`
      });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playlistNotDuplicate: never;
  }
}
