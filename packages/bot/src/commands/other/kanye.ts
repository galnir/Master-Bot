import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'kanye',
  description: 'Respostas com uma citação aleatória de Kanye',
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
          .setColor('Orange')
          .setAuthor({
            name: 'Kanye West',
            url: 'https://kanye.rest',
            iconURL: 'https://i.imgur.com/SsNoHVh.png'
          })
          .setDescription(quote)
          .setTimestamp()
          .setFooter({
            text: 'Desenvolvido por kanye.rest'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao buscar uma citação de Kanye :('
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
