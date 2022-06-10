import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'motivation',
  description: 'Replies with a motivational quote!'
})
export class MotivationCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    axios
      .get('https://type.fit/api/quotes')
      .then(async response => {
        const quotes = response.data;

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const embed = new MessageEmbed()
          .setColor('#FFD77A')
          .setAuthor({
            name: 'Motivational Quote',
            url: 'https://type.fit',
            iconURL: 'https://i.imgur.com/Cnr6cQb.png'
          })
          .setDescription(`*"${randomQuote.text}*"\n\n-${randomQuote.author}`)
          .setTimestamp()
          .setFooter({
            text: 'Powered by type.fit'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        console.error(error);
        return await interaction.reply(
          'Something went wrong when fetching a motivational quote :('
        );
      });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
