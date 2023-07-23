import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { Colors, EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'rockpaperscissors',
	description: 'Play rock paper scissors with me!',
	preconditions: ['isCommandDisabled']
})
export class RockPaperScissorsCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('move')
						.setDescription('What is your move?')
						.setRequired(true)
						.addChoices(
							{ name: 'Rock', value: 'rock' },
							{ name: 'Paper', value: 'paper' },
							{ name: 'Scissors', value: 'scissors' }
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const move = interaction.options.getString('move', true) as
			| 'rock'
			| 'paper'
			| 'scissors';
		const resultMessage = this.rpsLogic(move);

		const embed = new EmbedBuilder()
			.setColor(Colors.White)
			.setTitle('Rock, Paper, Scissors')
			.setDescription(`**${resultMessage[0]}**, I formed ${resultMessage[1]}`);

		return await interaction.reply({ embeds: [embed] });
	}

	private rpsLogic(player_move: string) {
		const bot_move = ['rock', 'paper', 'scissors'][
			Math.floor(Math.random() * 3)
		];

		if (player_move === 'rock') {
			if (bot_move === 'rock') {
				return ['Tie!', 'Rock'];
			}
			if (bot_move === 'paper') {
				return ['I win!', 'Paper'];
			}
			return ['You win!', 'Scissors'];
		} else if (player_move === 'paper') {
			if (bot_move === 'rock') {
				return ['You win!', 'Rock'];
			}
			if (bot_move === 'paper') {
				return ['Tie!', 'Paper'];
			}
			return ['I win!', 'Scissors'];
		} else {
			if (bot_move === 'rock') {
				return ['I win!', 'Rock'];
			}
			if (bot_move === 'paper') {
				return ['You win!', 'Paper'];
			}
			return ['Tie!', 'Scissors'];
		}
	}
}
