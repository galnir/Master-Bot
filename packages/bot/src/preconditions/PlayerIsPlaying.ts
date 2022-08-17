import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<PreconditionOptions>({
  name: 'playerIsPlaying'
})
export class PlayerIsPlaying extends Precondition {
  public override chatInputRun(
    interaction: CommandInteraction
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
