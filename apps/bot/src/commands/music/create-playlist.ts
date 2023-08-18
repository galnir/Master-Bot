import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
	name: 'create-playlist',
	description: 'Create a custom playlist that you can play anytime',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistNotDuplicate'
	]
})
export class CreatePlaylistCommand extends Command {
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
							'What is the name of the playlist you want to create?'
						)
						.setRequired(true)
				)
		);
	}
	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const playlistName = interaction.options.getString('playlist-name', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.reply({
				content: ':x: Something went wrong! Please try again later'
			});
		}

		try {
			const playlist = await trpcNode.playlist.create.mutate({
				name: playlistName,
				userId: interactionMember.id
			});

			if (!playlist) throw new Error();
		} catch (error) {
			await interaction.reply({
				content: `:x: You already have a playlist named **${playlistName}**`
			});
			return;
		}

		await interaction.reply(`Created a playlist named **${playlistName}**`);
		return;
	}
}
