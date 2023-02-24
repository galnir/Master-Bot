import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import translate from 'google-translate-api-x';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'translate',
  description:
    'Traduza de qualquer idioma para qualquer idioma usando o Google Tradutor',
  preconditions: ['GuildOnly', 'isCommandDisabled', 'validateLanguageCode']
})
export class TranslateCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const targetLang = interaction.options.getString('target', true);

    const text = interaction.options.getString('text', true);
    translate(text, {
      to: targetLang,
      requestFunction: axios
    })
      .then(async (response: any) => {
        const embed = new EmbedBuilder()
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
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('target')
            .setDescription(
              'What is the target language?(language you want to translate to)'
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('text')
            .setDescription('What text do you want to translate?')
            .setRequired(true)
        )
    );
  }
}
