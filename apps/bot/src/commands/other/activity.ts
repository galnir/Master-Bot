import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { GuildMember, VoiceChannel } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'activity',
	description: "Generate an invite link to your voice channel's activity",
	preconditions: ['isCommandDisabled', 'GuildOnly', 'inVoiceChannel']
})
export class ActivityCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addChannelOption(option =>
					option
						.setName('channel')
						.setDescription('Channel to invite to')
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('activity')
						.setDescription('Activity to invite to')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const channel = interaction.options.getChannel('channel', true);
		const activity = interaction.options.getString('activity', true);

		if (
			channel.type.toString() !== 'GUILD_VOICE' ||
			channel.type.toString() === 'GUILD_CATEGORY'
		) {
			return interaction.reply({
				content: 'You can only invite to voice channels!'
			});
		}

		const member = interaction.member as GuildMember;

		if (!member) {
			return interaction.reply({
				content: 'You must be in a voice channel to use this command!'
			});
		}

		if (member.voice.channelId !== channel.id) {
			return interaction.reply({
				content: 'You must be in the same voice channel to use this command!'
			});
		}

		try {
			const invite = await (channel as VoiceChannel).createInvite({
				reason: 'Activity invite'
			});

			return interaction.reply({
				content: `[Click to join ${activity} in ${channel.name}](${invite.url})`
			});
		} catch {
			return interaction.reply({
				content: 'Something went wrong!'
			});
		}
	}
}
