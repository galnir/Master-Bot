import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'fortune',
  description: 'Replies with a fortune cookie tip!',
  preconditions: ['isCommandDisabled']
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
            name: 'Fortune Cookie',
            url: 'https://yerkee.com',
            iconURL: 'https://i.imgur.com/58wIjK0.png'
          })
          .setDescription(tip)
          .setTimestamp()
          .setFooter({
            text: 'Desenvolvido por yerkee.com'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao buscar um biscoito da sorte :('
        );
      });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
