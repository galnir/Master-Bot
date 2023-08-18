import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'kanye',
	description: 'Replies with a random Kanye quote',
	preconditions: ['isCommandDisabled']
})
export class KanyeCommand extends Command {
	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		try {
			const response = await fetch('https://api.kanye.rest/?format=json');
			const data = await response.json();

			if (!data.quote)
				return interaction.reply({ content: 'Something went wrong!' });

			const embed = new EmbedBuilder()
				.setColor('Orange')
				.setAuthor({
					name: 'Kanye Omari West',
					url: 'https://kanye.rest',
					iconURL: 'https://i.imgur.com/SsNoHVh.png'
				})
				.setDescription(data.quote)
				.setTimestamp()
				.setFooter({
					text: 'Powered by kanye.rest'
				});

			return interaction.reply({ embeds: [embed] });
		} catch {
			return interaction.reply({
				content: 'Something went wrong!'
			});
		}
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
