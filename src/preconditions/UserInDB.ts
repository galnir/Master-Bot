import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'userInDB'
})
export class UserInDB extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const guildMember = interaction.member as GuildMember;

    try {
      await prisma.user.upsert({
        where: {
          id: guildMember.id
        },
        update: {},
        create: {
          id: guildMember.id,
          username: guildMember.user.username
        }
      });
    } catch (error) {
      console.error(error);
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
