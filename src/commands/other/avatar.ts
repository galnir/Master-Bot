import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'avatar',
  description: `Responds with a user's avatar`,
  preconditions: ['GuildOnly']
})
export class AvatarCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const embed = new MessageEmbed()
      .setTitle(user.username)
      .setImage(user.displayAvatarURL({ dynamic: true }))
      .setColor('#0x00ae86');

    return await interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'USER',
          required: true,
          name: 'user',
          description: `Which user's avatar do you want to look at?`
        }
      ]
    });
  }
}
