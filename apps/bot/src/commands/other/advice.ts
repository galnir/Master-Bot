import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'advice',
	description: 'Get some advice!',
	preconditions: ['isCommandDisabled']
})
export class AdviceCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		try {
			const response = await fetch('https://api.adviceslip.com/advice');
			const data = await response.json();

			const advice = data.slip?.advice;

			if (!advice) {
				return interaction.reply({ content: 'Something went wrong!' });
			}

			const embed = new EmbedBuilder()
				.setColor('NotQuiteBlack')
				.setAuthor({
					name: 'Advice Slip',
					url: 'https://adviceslip.com/',
					iconURL: 'https://i.imgur.com/8pIvnmD.png'
				})
				.setDescription(advice)
				.setTimestamp()
				.setFooter({
					text: `Powered by adviceslip.com`
				});

			return interaction.reply({ embeds: [embed] });
		} catch {
			return interaction.reply({ content: 'Something went wrong!' });
		}
	}
}
