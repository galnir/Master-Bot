import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
	name: 'trump',
	description: 'Replies with a random Trump quote',
	preconditions: ['isCommandDisabled']
})
export class TrumpCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	public override chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		axios
			.get('https://api.tronalddump.io/random/quote')
			.then(async response => {
				const quote: string = response.data.value;
				const embed = new EmbedBuilder()
					.setColor('Orange')
					.setAuthor({
						name: 'Donald Trump',
						url: 'https://api.tronalddump.io/random/quote',
						iconURL:
							'https://www.whitehouse.gov/wp-content/uploads/2021/01/45_donald_trump.jpg'
					})
					.setDescription(quote)
					.setTimestamp(response.data.appeared_at)
					.setFooter({
						text: 'Powered by api.tronalddump.io'
					});
				return interaction.reply({ embeds: [embed] });
			})
			.catch(async error => {
				// Logger.error(error);
				return interaction.reply({
					content: 'Something went wrong when fetching a Trump quote :('
				});
			});
	}
}
