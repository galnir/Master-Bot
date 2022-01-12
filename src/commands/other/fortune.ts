import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'fortune',
  description: 'Replies with a fortune cookie tip!'
})
export class FortuneCommand extends Command {
  public override chatInputRun(interaction: CommandInteraction) {
    axios
      .get('http://yerkee.com/api/fortune')
      .then(async response => {
        const tip: string = response.data.fortune;
        const embed = new MessageEmbed()
          .setColor('#F4D190')
          .setAuthor({
            name: 'Fortune Coookie',
            url: 'https://yerkee.com',
            iconURL: 'https://i.imgur.com/58wIjK0.png'
          })
          .setDescription(tip)
          .setTimestamp()
          .setFooter({
            text: 'Powered by yerkee.com'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        console.error(error);
        return await interaction.reply(
          'Something went wrong when fetching a fortune cookie :('
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
