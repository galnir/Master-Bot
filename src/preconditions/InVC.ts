import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
  name: 'inVoiceChannel'
})
export class inVoiceChannel extends Precondition {
  public override chatInputRun(
    interaction: CommandInteraction
  ): PreconditionResult {
    const member = interaction.member as GuildMember;
    const voiceChannel = member!.voice!.channel;

    if (!voiceChannel) {
      return this.error({
        message: 'You must be in a voice channel in order to use this command!'
      });
    }
    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    inVoiceChannel: never;
  }
}
