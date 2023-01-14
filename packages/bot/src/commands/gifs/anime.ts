import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'anime',
  description: 'Replies with a random anime gif!',
  preconditions: ['isCommandDisabled']
})
export class AnimeCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    if (!process.env.TENOR_API) return;
    axios
      .get(
        `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API}&q=anime&limit=1&random=true`
      )
      .then(async response => {
        return await interaction.reply({
          content: response.data.results[0].url
        });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Something went wrong when trying to fetch a anime gif :('
        );
      });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
