import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, User } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'userInDB'
})
export class UserInDB extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const user = interaction.user as User; // User allows for DMs

    try {
      await prisma.user.upsert({
        where: {
          id: user.id
        },
        update: {},
        create: {
          id: user.id,
          username: user.username
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
