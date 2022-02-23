import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import Member from '../lib/models/Member';
import addMemberToDB from '../lib/utils/db/addMemberToDB';

@ApplyOptions<PreconditionOptions>({
  name: 'validatePlaylistName'
})
export class ValidatePlaylistName extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const playlistName = interaction.options.getString('playlist-name', true);

    const guildMember = interaction.member as GuildMember;

    const exists = await Member.exists({ memberId: guildMember.id });

    if (!exists) {
      await addMemberToDB(guildMember);
      return this.ok();
    }

    const member = await Member.findOne({ memberId: guildMember.id });
    let found = false;
    if (
      member.savedPlaylists.filter(function searchForDuplicate(playlist: any) {
        return playlist.name == playlistName;
      }).length > 0
    ) {
      found = true;
    }
    return found
      ? this.error({
          message: `There is already a playlist named **${playlistName}** in your saved playlists!`
        })
      : this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    validatePlaylistName: never;
  }
}
