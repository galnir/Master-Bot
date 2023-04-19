import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
  name: 'playlistExists'
})
export class PlaylistExists extends Precondition {
  public override async chatInputRun(
    interaction: ChatInputCommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    const playlist = await trpcNode.playlist.getPlaylist.query({
      name: playlistName,
      userId: guildMember.id
    });

    return playlist
      ? this.ok()
      : this.error({
          message: `Você não tem nenhuma playlist nomeada **${playlistName}**`
        });
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playlistExists: never;
  }
}
