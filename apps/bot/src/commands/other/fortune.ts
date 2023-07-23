import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'fortune',
	description: 'Replies with a fortune cookie tip!',
	preconditions: ['isCommandDisabled']
})
export class FortuneCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		try {
			const response = await fetch('http://yerkee.com/api/fortune');
			const data = await response.json();

			const tip = data.fortune;

			if (!tip) {
				return interaction.reply({
					content: 'Something went wrong!'
				});
			}

			const embed = new EmbedBuilder()
				.setColor('Orange')
				.setAuthor({
					name: 'Fortune Cookie',
					url: 'https://yerkee.com',
					iconURL: 'https://i.imgur.com/58wIjK0.png'
				})
				.setDescription(tip)
				.setTimestamp()
				.setFooter({
					text: 'Powered by yerkee.com'
				});
			return interaction.reply({ embeds: [embed] });
		} catch {
			return interaction.reply({
				content: 'Something went wrong!'
			});
		}
	}
}
