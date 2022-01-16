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
    const voiceChannel = member.voice!.channel as VoiceBasedChannel;

    const { client } = container;
    const player = client.music.players.get(interaction.guildId as string);
    if (player && player.channelId !== voiceChannel.id) {
      return this.error({
        message: `You're in the wrong channel! Join <#${player.channelId}>`
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
