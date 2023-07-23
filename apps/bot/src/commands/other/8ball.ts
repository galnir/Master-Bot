import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: '8ball',
	description: 'Get the answer to anything!',
	preconditions: ['isCommandDisabled']
})
export class EightBallCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('question')
						.setDescription('The question you want to ask the 8ball')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const question = interaction.options.getString('question', true);
		if (question.length > 255) {
			return await interaction.reply({
				content:
					'Your question is too long! Please keep it under 255 characters.'
			});
		}

		const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

		const embed = new EmbedBuilder()
			.setTitle(question)
			.setAuthor({
				name: 'Magic 8ball',
				iconURL: 'https://i.imgur.com/HbwMhWM.png'
			})
			.setDescription(randomAnswer)
			.setColor('DarkButNotBlack')
			.setTimestamp();

		return interaction.reply({ embeds: [embed] });
	}
}

const answers = [
	'Yes.',
	'No.',
	'My sources say yes!',
	'Most likely.',
	"I don't know.",
	'Maybe, sometimes.',
	'Outlook is good.',
	'Signs point to yes.',
	'Definitely!',
	'Absolutely!',
	'Nope.',
	"No thanks, I won't be able to make it.",
	'No Way!',
	"It's certain.",
	"It's decidedly so.",
	'Without a doubt.',
	'Yes - definitely.',
	'You can rely on it.',
	'As I see it, yes.'
];
