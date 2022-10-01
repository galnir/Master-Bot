import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import Logger from '../lib/utils/logger';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
  name: 'timeZoneExists'
})
export class TimeZoneExists extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const discordUser = interaction.user;

    try {
      const user = await trpcNode.user.create.mutate({
        id: discordUser.id,
        name: discordUser.username
      });

      if (!user) throw new Error();
    } catch (error) {
      Logger.error(error);
      return this.error({ message: 'Something went wrong!' });
    }

    const subCommand = interaction.options.getSubcommand(true);

    if (subCommand == 'set') {
      const user = await trpcNode.user.getUserById.query({
        id: discordUser.id
      });

      return Number.isInteger(user.user?.timeOffset)
        ? this.ok()
        : this.error({
            message: `You have no Time Zone saved\n Please the use \`/reminder save-timezone\` first.`
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
