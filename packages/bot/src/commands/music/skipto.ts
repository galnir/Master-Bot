import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'skipto',
  description: 'Pular para alguma música específica que está na fila',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SkipToCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const position = interaction.options.getInteger('position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (position > length || position < 1) {
      return await interaction.reply(
        ':x: Please enter a valid track position.'
      );
    }

    await queue.skipTo(position);

    await interaction.reply(
      `:white_check_mark: Skipped to track number ${position}!`
    );

    return;
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
              'What is the position of the song you want to skip to in queue?'
            )
            .setRequired(true)
        )
    );
  }
}
