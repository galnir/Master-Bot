import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<PreconditionOptions>({
  name: 'musicTriviaPlaying'
})
export class musicTriviaPlaying extends Precondition {
  public override chatInputRun(
    interaction: CommandInteraction
  ): PreconditionResult {
    const { client } = container;

    const player = client.music.players.get(interaction.guildId as string);
    if (player?.triviaQueue.current) {
      return this.error({
        message: 'Please wait until the current music trivia ends!'
      });
    }

    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    musicTriviaPlaying: never;
  }
}
