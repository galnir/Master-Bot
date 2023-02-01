import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import translate from 'google-translate-api-x';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'translate',
  description:
    'Traduza de qualquer idioma para qualquer idioma usando o Google Tradutor',
  preconditions: ['GuildOnly', 'isCommandDisabled', 'validateLanguageCode']
})
export class TranslateCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    const targetLang = interaction.options.getString('target', true);

    const text = interaction.options.getString('text', true);
    translate(text, {
      to: targetLang,
      requestFunction: 'axios'
    })
      .then(async (response: any) => {
        const embed = new MessageEmbed()
          .setColor('#770000')
          .setTitle('Google Tradutor')
          .setURL('https://translate.google.com/')
          .setDescription(response.text)
          .setFooter({
            iconURL: 'https://i.imgur.com/ZgFxIwe.png', // Google Translate Icon
            text: 'Powered by Google Tradutor'
          });

        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          ':x: Algo deu errado ao tentar traduzir o texto'
        );
      });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'target',
          type: 'STRING',
          required: true,
          description:
            'Qual é a língua alvo? (idioma para o qual você deseja traduzir)'
        },
        {
          name: 'text',
          type: 'STRING',
          required: true,
          description: 'Que texto você quer traduzir?'
        }
      ]
    });
  }
}
