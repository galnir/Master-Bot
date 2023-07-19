import { ApplyOptions } from '@sapphire/decorators';
import {
  Precondition,
  PreconditionOptions,
  PreconditionResult
} from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import ISO6391 from 'iso-639-1';

@ApplyOptions<PreconditionOptions>({
  name: 'validateLanguageCode'
})
export class ValidLanguageCode extends Precondition {
  public override chatInputRun(
    interaction: ChatInputCommandInteraction
  ): PreconditionResult {
    const targetLang = interaction.options.getString('target', true);
    const languageCode = ISO6391.getCode(targetLang);

    if (!languageCode) {
      return this.error({ message: ':x: Please enter a valid language!' });
    }
    return this.ok();
  }
}

declare module '@sapphire/framework' {
  export interface Preconditions {
    validateLanguageCode: never;
  }
}
