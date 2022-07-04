import { ApplyOptions } from '@sapphire/decorators';
import {
  AsyncPreconditionResult,
  Precondition,
  PreconditionOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import prisma from '../lib/prisma';

@ApplyOptions<PreconditionOptions>({
  name: 'isCommandDisabled'
})
export class IsCommandDisabled extends Precondition {
  public override async chatInputRun(
    interaction: CommandInteraction
  ): AsyncPreconditionResult {
    const commandID = interaction.commandId;
    const guildID = interaction.guildId as string;

    const guild = await prisma.guild.findFirst({
      where: {
        id: guildID
      },
      select: {
        disabledCommands: true
      }
    });

    if (guild?.disabledCommands.some(id => id === commandID)) {
      return this.error({
        message: 'This command is disabled!'
      });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    isCommandDisabled: never;
  }
}
