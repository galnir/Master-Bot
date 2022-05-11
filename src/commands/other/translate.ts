import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import translate from '@vitalets/google-translate-api';

@ApplyOptions<CommandOptions>({
  name: 'translate',
  description:
    'Translate from any language to any language using Google Translate',
  preconditions: ['GuildOnly', 'validateLanguageCode']
})
export class TranslateCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    const targetLang = interaction.options.getString('target', true);

    const text = interaction.options.getString('text', true);

    translate(text, { to: targetLang })
      .then(async response => {
        const embed = new MessageEmbed()
          .setColor('#770000')
          .setTitle('Google Translate')
          .setURL('https://translate.google.com/')
          .setDescription(response.text)
          .setFooter({ text: 'Powered by Google Translate' });

        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        console.error(error);
        return await interaction.reply(
          ':x: Something went wrong when trying to translate the text'
        );
      });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'target',
          type: 'STRING',
          required: true,
          description:
            'What is the target language?(language you want to translate to)'
        },
        {
          name: 'text',
          type: 'STRING',
          required: true,
          description: 'What text do you want to translate?'
        }
      ]
    });
  }
}
