import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'kanye',
  description: 'Replies with a random Kanye quote'
})
export class KanyeCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    axios
      .get('https://api.kanye.rest/?format=json')
      .then(async response => {
        const quote: string = response.data.quote;
        const embed = new MessageEmbed()
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
        console.error(error);
        return await interaction.reply(
          'Something went wrong when fetching a Kanye quote :('
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
