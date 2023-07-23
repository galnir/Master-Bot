import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/framework';
import { GeniusLyrics } from 'genius-discord-lyrics';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

const genius = new GeniusLyrics(process.env.GENIUS_API || '');

@ApplyOptions<CommandOptions>({
	name: 'lyrics',
	description:
		'Get the lyrics of any song or the lyrics of the currently playing song!',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class LyricsCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('title')
						.setDescription(':mag: What song lyrics would you like to get?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;
		let title = interaction.options.getString('title');

		const player = client.music.players.get(interaction.guild!.id);

		await interaction.deferReply();

		if (!title) {
			if (!player) {
				return await interaction.followUp(
					'Please provide a valid song name or start playing one and try again!'
				);
			}
			//title = player.queue.current?.title as string;
			title = 'hi';
		}

		try {
			const lyrics = (await genius.fetchLyrics(title)) as string;
			const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
			const paginatedLyrics = new PaginatedMessage({
				template: new EmbedBuilder().setColor('Red').setTitle(title).setFooter({
					text: 'Provided by genius.com',
					iconURL:
						'https://assets.genius.com/images/apple-touch-icon.png?1652977688' // Genius Lyrics Icon
				})
			});

			for (let i = 1; i <= lyricsIndex; ++i) {
				let b = i - 1;
				if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
					paginatedLyrics.addPageEmbed(embed => {
						return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
					});
				}
			}

			await interaction.followUp('Lyrics generated');
			return paginatedLyrics.run(interaction);
		} catch (e) {
			// Logger.error(e);
			return interaction.followUp(
				'Something when wrong when trying to fetch lyrics :('
			);
		}
	}
}
