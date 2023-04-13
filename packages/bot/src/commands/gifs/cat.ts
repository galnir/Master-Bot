import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'cat',
  description: 'Replies with a cute kitty picture!',
  preconditions: ['isCommandDisabled']
})
export class CatCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    if (!process.env.TENOR_API) return;
    axios
      .get(
        `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API}&q=cat&limit=1&random=true`
      )
      .then(async response => {
        return await interaction.reply({
          content: response.data.results[0].url
        });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Something went wrong when trying to fetch a cute kitty gif :('
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
