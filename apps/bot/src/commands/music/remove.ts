import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'remove',
  description: 'Remove a track from the queue',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class RemoveCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (position < 1 || position > length) {
      return interaction.reply(':x: Please enter a valid position number!');
    }

    await queue.removeAt(position - 1);
    return await interaction.reply({
      content: `Removed track at position ${position}`
    });
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption(option =>
          option
            .setName('position')
            .setDescription(
              'What is the position of the song you want to remove from the queue?'
            )
            .setRequired(true)
        )
    );
  }
}
