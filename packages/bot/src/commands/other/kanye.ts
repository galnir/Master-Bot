import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'kanye',
  description: 'Replies with a random Kanye quote',
  preconditions: ['isCommandDisabled']
})
export class KanyeCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('https://api.kanye.rest/?format=json')
      .then(async response => {
        const quote: string = response.data.quote;
        const embed = new EmbedBuilder()
          .setColor('#F4D190')
          .setAuthor({
            name: 'Kanye West',
            url: 'https://kanye.rest',
            iconURL: 'https://i.imgur.com/SsNoHVh.png'
          })
          .setDescription(quote)
          .setTimestamp()
          .setFooter({
            text: 'Powered by kanye.rest'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Something went wrong when fetching a Kanye quote :('
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
