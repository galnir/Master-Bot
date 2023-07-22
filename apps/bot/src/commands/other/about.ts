import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'about',
	description: 'Display info about the bot!'
})
export class AboutCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const embed = new EmbedBuilder()
			.setTitle('About')
			.setDescription(
				'A Discord bot with slash commands, playlist support, Spotify, music quiz, saved playlists, lyrics, gifs and more.\n\n :white_small_square: [Commands](https://github.com/galnir/Master-Bot#commands)\n :white_small_square: [Contributors](https://github.com/galnir/Master-Bot#contributors-%EF%B8%8F)'
			)
			.setColor('Aqua');

		return interaction.reply({ embeds: [embed] });
	}
}
