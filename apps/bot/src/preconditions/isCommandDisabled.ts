import { ApplyOptions } from '@sapphire/decorators';
import {
	AsyncPreconditionResult,
	Precondition,
	PreconditionOptions
} from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { trpcNode } from '../trpc';

@ApplyOptions<PreconditionOptions>({
	name: 'isCommandDisabled'
})
export class IsCommandDisabledPrecondition extends Precondition {
	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	): AsyncPreconditionResult {
		const commandID = interaction.commandId;
		const guildID = interaction.guildId as string;
		// Most likly a DM
		if (!interaction.guildId && interaction.user.id) {
			return this.ok();
		}
		const data = await trpcNode.command.getDisabledCommands.query({
			guildId: guildID
		});

		if (data.disabledCommands.includes(commandID)) {
			return this.error({
				message: 'This command is disabled'
			});
		}

		return this.ok();
	}
}

declare module '@sapphire/framework' {
	export interface Preconditions {
		isCommandDisabled: never;
	}
}
