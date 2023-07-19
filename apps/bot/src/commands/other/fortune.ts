import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'fortune',
  description: 'Replies with a fortune cookie tip!',
  preconditions: ['isCommandDisabled']
})
export class FortuneCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('http://yerkee.com/api/fortune')
      .then(async response => {
        const tip: string = response.data.fortune;
        const embed = new EmbedBuilder()
          .setColor('Orange')
          .setAuthor({
            name: 'Fortune Cookie',
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
        Logger.error(error);
        return await interaction.reply(
          'Something went wrong when fetching a fortune cookie :('
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
