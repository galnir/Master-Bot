import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import { container } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
  name: 'playerIsPlaying'
})
export class PlayerIsPlaying extends Precondition {
  public override chatInputRun(
    interaction: ChatInputCommandInteraction
  ): PreconditionResult {
    const { client } = container;
    const player = client.music.players.get(interaction.guildId as string);

    if (!player) {
      return this.error({ message: 'There is nothing playing at the moment!' });
    }
    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    playerIsPlaying: never;
  }
}