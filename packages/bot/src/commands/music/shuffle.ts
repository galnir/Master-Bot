import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'shuffle',
  description: 'Embaralhar a fila de músicas!',
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

    if (!(await queue.count())) {
      return await interaction.reply(':x: Não existe músicas na fila!');
    }

    await queue.shuffleTracks();

    return await interaction.reply(':white_check_mark: Fila embaralhada!');
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
