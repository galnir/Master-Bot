import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'reminderNotDuplicate'
})
export class ReminderNotDuplicate extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    let subcommand = interaction.options.getSubcommand(true);

    if (subcommand == 'set') {
      let eventName = interaction.options.getString('event', true);
      const guildMember = interaction.member as GuildMember;

      let count;

      try {
        count = await prisma.reminder.count({
          where: {
            userId: guildMember.id,
            event: eventName
          }
        });
      } catch (error) {
        console.error(error);
        return this.error({ message: 'Something went wrong!' });
      }

      return count > 0
        ? this.error({
            message: `There is already a reminder named **${eventName}** saved!`
          })
        : this.ok();
    } else return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    reminderNotDuplicate: never;
  }
}
