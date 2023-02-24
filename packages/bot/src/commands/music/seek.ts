import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'seek',
  description: 'Procure um ponto desejado em uma música',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class SeekCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const seconds = interaction.options.getInteger('seconds', true);
    const milliseconds = seconds * 1000;

    const queue = client.music.queues.get(interaction.guildId!);
    const track = await queue.getCurrentTrack();
    if (!track)
      return await interaction.reply(':x: Não tem nenhuma música tocando!'); // should never happen
    if (!track.isSeekable)
      return await interaction.reply(':x: Esta música não é pesquisável!');

    if (milliseconds > track.length || milliseconds < 0) {
      return await interaction.reply(':x: Por favor, insira um número válido!');
    }

    const player = queue.player;
    await player.seek(milliseconds);

    return await interaction.reply(`Buscado ${seconds} segundos`);
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
            .setName('seconds')
            .setDescription(
              'To what point in the track do you want to seek? (in seconds)'
            )
            .setRequired(true)
        )
    );
  }
}
