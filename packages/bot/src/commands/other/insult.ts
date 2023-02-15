import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'insult',
  description: 'Respostas com um insulto maldoso',
  preconditions: ['isCommandDisabled']
})
export class InsultCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('https://evilinsult.com/generate_insult.php?lang=en&type=json')
      .then(async response => {
        const insult: string = response.data.insult;
        const embed = new EmbedBuilder()
          .setColor('#E41032')
          .setAuthor({
            name: 'Evil Insult',
            url: 'https://evilinsult.com',
            iconURL: 'https://i.imgur.com/bOVpNAX.png'
          })
          .setDescription(insult)
          .setTimestamp()
          .setFooter({
            text: 'Desenvolvido por evilinsult.com'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao buscar um insulto :('
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
