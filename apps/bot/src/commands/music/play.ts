import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';
import searchSong from '../../lib/music/searchSong';
import type { Song } from '../../lib/music/classes/Song';
import { trpcNode } from '../../trpc';
import { GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'play',
	description: 'Play any song or playlist from YouTube, Spotify and more!',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'inPlayerVoiceChannel'
	]
})
export class PlayCommand extends Command {
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
						.setDescription(
							'What song or playlist would you like to listen to?'
						)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('is-custom-playlist')
						.setDescription('Is it a custom playlist?')
						.addChoices(
							{
								name: 'Yes',
								value: 'Yes'
							},
							{
								name: 'No',
								value: 'No'
							}
						)
				)
				.addStringOption(option =>
					option
						.setName('shuffle-playlist')
						.setDescription('Would you like to shuffle the playlist?')
						.addChoices(
							{
								name: 'Yes',
								value: 'Yes'
							},
							{
								name: 'No',
								value: 'No'
							}
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();

		const { client } = container;

		const query = interaction.options.getString('query', true);
		const isCustomPlaylist =
			interaction.options.getString('is-custom-playlist');

		const shufflePlaylist = interaction.options.getString('shuffle-playlist');

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.followUp(
				':x: Something went wrong! Please try again later'
			);
		}

		const { music } = client;

		const voiceChannel = (interaction.member as GuildMember).voice.channel;

		// edge case - someome initiated the command but left the voice channel
		if (!voiceChannel) {
			return interaction.followUp({
				content: ':x: You need to be in a voice channel to use this command!'
			});
		}

		let queue = music.queues.get(interaction.guildId!);
		await queue.setTextChannelID(interaction.channel!.id);

		if (!queue.player) {
			const player = queue.createPlayer();
			await player.connect(voiceChannel.id, { deafened: true });
		}

		let tracks: Song[] = [];
		let message: string = '';

		if (isCustomPlaylist == 'Yes') {
			const data = await trpcNode.playlist.getPlaylist.query({
				userId: interactionMember.id,
				name: query
			});

			const { playlist } = data;

			if (!playlist) {
				return await interaction.followUp(`:x: You have no such playlist!`);
			}
			if (!playlist.songs.length) {
				return await interaction.followUp(`:x: **${query}** is empty!`);
			}

			const { songs } = playlist;
			tracks.push(...songs);
			message = `Added songs from **${playlist}** to the queue!`;
		} else {
			const trackTuple = await searchSong(query, interaction.user);
			if (!trackTuple[1].length) {
				return await interaction.followUp({ content: trackTuple[0] as string }); // error
			}
			message = trackTuple[0];
			tracks.push(...trackTuple[1]);
		}

		await queue.add(tracks);
		if (shufflePlaylist == 'Yes') {
			await queue.shuffleTracks();
		}

		const current = await queue.getCurrentTrack();
		if (current) {
			client.emit(
				'musicSongPlayMessage',
				interaction.channel,
				await queue.getCurrentTrack()
			);
			return;
		}

		queue.start();

		return await interaction.followUp({ content: message });
	}
}
