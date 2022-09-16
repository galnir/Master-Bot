import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction, User } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
  name: 'timeZoneExists'
})
export class TimeZoneExists extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const subCommand = interaction.options.getSubcommand(true);

    if (subCommand == 'set') {
      const discordUser = interaction.user as User;

      const user = await trpcNode.query('user.get-user-by-id', {
        id: discordUser.id
      });

      return user.user?.timeZone
        ? this.ok()
        : this.error({
            message: `You have no Time Zone saved`
          });
    }
    return this.ok(); // ok its not the Set Sub_Command
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    timeZoneExists: never;
  }
}
