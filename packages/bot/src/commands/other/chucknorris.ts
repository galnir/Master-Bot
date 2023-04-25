import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'chucknorris',
  description: 'Obtenha um fato satírico sobre Chuck Norris!',
  preconditions: ['isCommandDisabled']
})
export class ChuckNorrisCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('https://api.chucknorris.io/jokes/random')
      .then(async response => {
        const embed = new EmbedBuilder()
          .setColor('Orange')
          .setAuthor({
            name: 'Chuck Norris',
            url: 'https://chucknorris.io',
            iconURL: response.data.icon_url
          })
          .setDescription(response.data.value)
          .setTimestamp()
          .setFooter({
            text: 'Desenvolvido por chucknorris.io'
          });
        return interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          ':x: Ocorreu um erro, Chuck está investigando isso!'
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
