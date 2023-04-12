import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'avatar',
  description: `Responds with a user's avatar`,
  preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class AvatarCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const user = interaction.options.getUser('user', true);
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setImage(user.displayAvatarURL())
      .setColor('Aqua');

    return await interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription(`Which user's avatar do you want to look at?`)
            .setRequired(true)
        )
    );
  }
}
