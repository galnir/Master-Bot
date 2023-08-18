import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import searchSong from '../../lib/music/searchSong';
import { trpcNode } from '../../trpc';
import Logger from '../../lib/logger';

@ApplyOptions<CommandOptions>({
	name: 'save-to-playlist',
	description: 'Save a song or a playlist to a custom playlist',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistExists'
	]
})
export class SaveToPlaylistCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('playlist-name')
						.setDescription(
							'What is the name of the playlist you want to save to?'
						)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('url')
						.setDescription('What do you want to save to the custom playlist?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const playlistName = interaction.options.getString('playlist-name', true);
		const url = interaction.options.getString('url', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.followUp(
				':x: Something went wrong! Please try again later'
			);
		}

		const playlistQuery = await trpcNode.playlist.getPlaylist.query({
			name: playlistName,
			userId: interactionMember.id
		});

		if (!playlistQuery.playlist) {
			return await interaction.followUp('Playlist does not exist');
		}

		const playlistId = playlistQuery.playlist.id;

		const songTuple = await searchSong(url, interaction.user);
		if (!songTuple[1].length) {
			return await interaction.followUp(songTuple[0]);
		}

		const songArray = songTuple[1];
		const songsToAdd: any[] = [];

		for (let i = 0; i < songArray.length; i++) {
			const song = songArray[i];
			delete song['requester'];
			songsToAdd.push({
				...song,
				playlistId: +playlistId
			});
		}

		try {
			await trpcNode.song.createMany.mutate({
				songs: songsToAdd
			});

			return await interaction.followUp(`Added tracks to **${playlistName}**`);
		} catch (error) {
			Logger.error(error);
			return await interaction.followUp(':x: Something went wrong!');
		}
	}
}
