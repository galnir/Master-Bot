import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'leave',
  description: 'Make the bot leave its voice channel and stop playing music',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class LeaveCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;

    const queue = client.music.queues.get(interaction.guildId!);

    await queue.leave();

    await interaction.reply({ content: 'Left the voice channel.' });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
