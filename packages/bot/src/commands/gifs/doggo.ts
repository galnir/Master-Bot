import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'doggo',
  description: 'Replies with a cute doggo picture!',
  preconditions: ['isCommandDisabled']
})
export class DoggoCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    if (!process.env.DOGGO_API) return;
    axios
      .get(
        `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API}&q=dog&limit=1&random=true`
      )
      .then(async response => {
        return await interaction.reply({
          content: response.data.results[0].url
        });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Something went wrong when trying to fetch a cute doggo gif :('
        );
      });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
