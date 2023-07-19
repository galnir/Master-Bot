import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'about',
  description: 'Display info about the bot!',
  preconditions: ['isCommandDisabled']
})
export class AboutCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const embed = new EmbedBuilder()
      .setTitle('About')
      .setDescription(
        'A Discord bot with slash commands, playlist support, Spotify, music quiz, saved playlists, lyrics, gifs and more.\n\n :white_small_square: [Commands](https://github.com/galnir/Master-Bot#commands)\n :white_small_square: [Contributors](https://github.com/galnir/Master-Bot#contributors-%EF%B8%8F)'
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
