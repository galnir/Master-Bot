import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import Logger from '../lib/utils/logger';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
  name: 'userInDB'
})
export class UserInDB extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const guildMember = interaction.member as GuildMember;

    try {
      const user = await trpcNode.user.create.mutate({
        id: guildMember.id,
        name: guildMember.user.username
      });

      if (!user) throw new Error();
    } catch (error) {
      Logger.error(error);
      return this.error({ message: 'Something went wrong!' });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    userInDB: never;
  }
}
