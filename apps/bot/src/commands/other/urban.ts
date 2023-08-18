import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/logger';

@ApplyOptions<CommandOptions>({
	name: 'urban',
	description: 'Get definitions from urban dictionary',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class UrbanCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('What term do you want to look up?')
						.setRequired(true)
				)
		);
	}

	public override chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const query = interaction.options.getString('query', true);
		axios
			.get(`https://api.urbandictionary.com/v0/define?term=${query}`)
			.then(async response => {
				const definition: string = response.data.list[0].definition;
				const embed = new EmbedBuilder()
					.setColor('DarkOrange')
					.setAuthor({
						name: 'Urban Dictionary',
						url: 'https://urbandictionary.com',
						iconURL: 'https://i.imgur.com/vdoosDm.png'
					})
					.setDescription(definition)
					.setURL(response.data.list[0].permalink)
					.setTimestamp()
					.setFooter({
						text: 'Powered by UrbanDictionary'
					});
				return interaction.reply({ embeds: [embed] });
			})
			.catch(async error => {
				Logger.error(error);
				return interaction.reply({
					content: 'Failed to deliver definition :sob:'
				});
			});
	}
}
