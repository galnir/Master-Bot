import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'timeZoneExists'
})
export class TimeZoneExists extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const subCommand = interaction.options.getSubcommand(true);

    if (subCommand == 'set') {
      const guildMember = interaction.member as GuildMember;

      const user = await prisma.user.findFirst({
        where: {
          id: guildMember.id
        },
        select: { timeZone: true }
      });
      if (user?.timeZone) return this.ok();
      else {
        return this.error({
          message:
            ":x: You don't have a timeZone Saved.\n Please run `/reminder save-timezone` before setting a reminder. "
        });
      }
    }
    return this.ok(); // ok its not the Set Sub_Command
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    timeZoneExists: never;
  }
}
