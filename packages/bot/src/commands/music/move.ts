import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'move',
  description: 'Move a track to a different position in queue',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class MoveCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const currentPosition = interaction.options.getInteger(
      'current-position',
      true
    );
    const newPosition = interaction.options.getInteger('new-position', true);

    const queue = client.music.queues.get(interaction.guildId!);
    const length = await queue.count();
    if (
      currentPosition < 1 ||
      currentPosition > length ||
      newPosition < 1 ||
      newPosition > length ||
      currentPosition == newPosition
    ) {
      return await interaction.reply(
        ':x: Por favor, insira números de posição válidos!'
      );
    }

    await queue.moveTracks(currentPosition - 1, newPosition - 1);
    return;
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
<<<<<<< HEAD
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'current-position',
          description: 'Qual é a posição da música que você quer mover?',
          type: 'INTEGER',
          required: true
        },
        {
          name: 'new-position',
          description: 'Qual é a posição para a qual você deseja mover a música?',
          type: 'INTEGER',
          required: true
        }
      ]
    });
=======
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption(option =>
          option
            .setName('current-position')
            .setDescription(
              'What is the position of the song you want to move?'
            )
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('new-position')
            .setDescription(
              'What is the position you want to move the song to?'
            )
            .setRequired(true)
        )
    );
>>>>>>> upgrade-to-v14
  }
}
