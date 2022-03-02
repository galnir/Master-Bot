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
  name: 'userInDB'
})
export class UserInDB extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const guildMember = interaction.member as GuildMember;

    const exists = await Member.exists({ memberId: guildMember.id });

    if (!exists) {
      try {
        await addMemberToDB(guildMember);
        return this.ok();
      } catch (err) {
        console.error(err);
        return this.error({ message: 'Something went wrong!' });
      }
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    userInDB: never;
  }
}
