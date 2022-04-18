import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'about',
  description: 'Display info about the bot!'
})
export class AboutCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const embed = new MessageEmbed()
      .setTitle('About')
      .setDescription('A Discord bot with slash commands, playlist support, Spotify, music quiz, saved playlists, lyrics, gifs and more.\n\n :white_small_square: [Commands](https://github.com/galnir/Master-Bot#commands)\n :white_small_square: [Contributors](https://github.com/galnir/Master-Bot#contributors-%EF%B8%8F)')
      .setColor('#0x00ae86');
                   
    return await interaction.reply({ embeds: [embed] });
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
