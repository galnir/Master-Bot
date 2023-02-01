import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'avatar',
  description: `Responde com o avatar de um usuário`,
  preconditions: ['GuildOnly', 'isCommandDisabled']
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
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'USER',
          required: true,
          name: 'user',
          description: `Qual avatar de usuário você deseja ver?`
        }
      ]
    });
  }
}
