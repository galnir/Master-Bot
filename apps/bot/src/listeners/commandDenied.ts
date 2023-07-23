import { ApplyOptions } from '@sapphire/decorators';
import {
	type ChatInputCommandDeniedPayload,
	Listener,
	type ListenerOptions,
	UserError
} from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
	name: 'chatInputCommandDenied'
})
export class CommandDeniedListener extends Listener {
	public override async run(
		{ context, message: content }: UserError,
		{ interaction }: ChatInputCommandDeniedPayload
	): Promise<void> {
		await interaction.reply({
			ephemeral: true,
			content: content
		});

		return;
	}
}
