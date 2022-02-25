import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import Member from '../lib/models/Member';
import type { SavedPlaylist } from '../commands/music/create-playlist';

@ApplyOptions<PreconditionOptions>({
  name: 'playlistExists'
})
export class PlaylistExists extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    const member = await Member.findOne({ memberId: guildMember.id });

    const savedPlaylists = member.savedPlaylists;

    if (
      savedPlaylists.some(
        (element: SavedPlaylist) => element.name === playlistName
      )
    ) {
      return this.ok();
    }

    return this.error({
      message: `You have no playlist named **${playlistName}**`
    });
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playlistExists: never;
  }
}
