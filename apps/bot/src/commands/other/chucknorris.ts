import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'chucknorris',
	description: 'Get a satirical fact about Chuck Norris!',
	preconditions: ['isCommandDisabled']
})
export class ChuckNorrisCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		try {
			const response = await fetch('https://api.chucknorris.io/jokes/random');
			const data = await response.json();

			const joke = data;

			if (!joke) {
				return interaction.reply({
					content: ':x: An error occured, Chuck is investigating this!'
				});
			}

			const embed = new EmbedBuilder()
				.setColor('Orange')
				.setAuthor({
					name: 'Chuck Norris',
					url: 'https://chucknorris.io',
					iconURL: joke.icon_url
				})
				.setDescription(joke.value)
				.setTimestamp()
				.setFooter({
					text: 'Powered by chucknorris.io'
				});
			return interaction.reply({ embeds: [embed] });
		} catch {
			return interaction.reply({
				content: ':x: An error occured, Chuck is investigating this!'
			});
		}
	}
}
