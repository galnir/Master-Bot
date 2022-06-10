import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import type {
  CommandInteraction,
  GuildMember,
  VoiceBasedChannel
} from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<PreconditionOptions>({
  name: 'inPlayerVoiceChannel'
})
export class inPlayerVoiceChannel extends Precondition {
  public override chatInputRun(
    interaction: CommandInteraction
  ): PreconditionResult {
    const member = interaction.member as GuildMember;
    // this precondition comes after a precondition that makes sure the user is in a voice channel
    const voiceChannel = member.voice!.channel as VoiceBasedChannel;

    const { client } = container;
    const queue = client.music.queues.get(interaction.guildId!);

    const queueVoiceChannel = queue.voiceChannel;
    if (queueVoiceChannel && queueVoiceChannel.id !== voiceChannel.id) {
      return this.error({
        message: `You're in the wrong channel! Join <#${queueVoiceChannel?.id}>`
      });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    inPlayerVoiceChannel: never;
  }
}
