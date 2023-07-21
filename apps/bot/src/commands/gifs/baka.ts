import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { env } from '../../env';

@ApplyOptions<Command.Options>({
	name: 'baka',
	description: 'Replies with a random baka gif!'
})
export class BakaCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		try {
			const response = await fetch(
				`https://tenor.googleapis.com/v2/search?key=${env.TENOR_API}&q=baka&limit=1&random=true`
			);
			const json = await response.json();
			if (!json.results)
				return await interaction.reply({
					content: 'Something went wrong! Please try again later.'
				});

			return await interaction.reply({ content: json.results[0].url });
		} catch (e) {
			return await interaction.reply({
				content: 'Something went wrong! Please try again later.'
			});
		}
	}
}
