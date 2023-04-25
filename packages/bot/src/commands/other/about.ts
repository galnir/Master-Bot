import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'about',
  description: 'Exibir informações sobre o bot!',
  preconditions: ['isCommandDisabled']
})
export class AboutCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const embed = new EmbedBuilder()
      .setTitle('About')
      .setDescription(
        'Um bot do Discord com comandos de barra, suporte a playlists, Spotify, quiz de música, playlists salvas, letras, gifs e muito mais.\n\n :white_small_square: [Commands](https://github.com/galnir/Master-Bot#commands)\n :white_small_square: [Contributors](https://github.com/galnir/Master-Bot#contributors-%EF%B8%8F)'
      )
      .setColor('Aqua');

    return await interaction.reply({ embeds: [embed] });
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
