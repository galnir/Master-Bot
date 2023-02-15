import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'trump',
  description: 'Respostas com uma citação aleatória de Trump',
  preconditions: ['isCommandDisabled']
})
export class TrumpCommand extends Command {
  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    axios
      .get('https://api.tronalddump.io/random/quote')
      .then(async response => {
        const quote: string = response.data.value;
        const embed = new EmbedBuilder()
          .setColor('#BB7D61')
          .setAuthor({
            name: 'Donald Trump',
            url: 'https://api.tronalddump.io/random/quote',
            iconURL:
              'https://www.whitehouse.gov/wp-content/uploads/2021/01/45_donald_trump.jpg'
          })
          .setDescription(quote)
          .setTimestamp(response.data.appeared_at)
          .setFooter({
            text: 'Desenvolvido por api.tronalddump.io'
          });
        return await interaction.reply({ embeds: [embed] });
      })
      .catch(async error => {
        Logger.error(error);
        return await interaction.reply(
          'Algo deu errado ao buscar uma citação de Trump :('
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
