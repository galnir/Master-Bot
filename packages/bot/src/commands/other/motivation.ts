import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'motivation',
  description: 'Respostas com uma citação motivacional!',
  preconditions: ['isCommandDisabled']
})
export class MotivationCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('https://type.fit/api/quotes')
      .then(async response => {
        const quotes = response.data;

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const embed = new EmbedBuilder()
          .setColor('Yellow')
          .setAuthor({
            name: 'Motivational Quote',
            url: 'https://type.fit',
            iconURL: 'https://i.imgur.com/Cnr6cQb.png'
          })
          .setDescription(`*"${randomQuote.text}*"\n\n-${randomQuote.author}`)
          .setTimestamp()
          .setFooter({
            text: 'Fornecido por type.fit'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao buscar uma citação motivacional :('
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
