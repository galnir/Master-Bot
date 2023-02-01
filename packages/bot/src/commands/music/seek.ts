import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
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
  public override async chatInputRun(interaction: CommandInteraction) {
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
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'seconds',
          type: 'INTEGER',
          description:
            'Até que ponto da música você quer buscar? (em segundos)',
          required: true
        }
      ]
    });
  }
}
