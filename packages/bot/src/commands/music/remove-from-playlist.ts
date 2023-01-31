import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'remove-from-playlist',
  description: 'Remover uma música de uma playlist salva',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistExists'
  ]
})
export class RemoveFromPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const playlistName = interaction.options.getString('playlist-name', true);
    const location = interaction.options.getInteger('location', true);

    const interactionMember = interaction.member as GuildMember;

    let playlist;
    try {
      const playlistQuery = await trpcNode.playlist.getPlaylist.query({
        name: playlistName,
        userId: interactionMember.id
      });

      playlist = playlistQuery.playlist;
    } catch (error) {
      return await interaction.followUp(':x: Alguma coisa deu errada!');
    }

    const songs = playlist?.songs;

    if (!songs?.length) {
      return await interaction.followUp(`:x: **${playlistName}** está vazia!`);
    }

    if (location > songs.length || location < 0) {
      return await interaction.followUp(':x: Por favor, insira um índice válido!');
    }

    const id = songs[location - 1].id;

    const song = await trpcNode.song.delete.mutate({
      id
    });

    if (!song) {
      return await interaction.followUp(':x: Alguma coisa deu errado!');
    }

    await interaction.followUp(
      `:wastebasket: **${song.song.title}** deletada da playlist **${playlistName}**`
    );
    return;
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'playlist-name',
          description:
            'Qual é o nome da playlist da qual você deseja remover?',
          type: 'STRING',
          required: true
        },
        {
          name: 'location',
          description:
            'Qual é o índice do vídeo que você gostaria de excluir da sua playlist salva?',
          type: 'INTEGER',
          required: true // todo: not required so if a song is playing it can be saved
        }
      ]
    });
  }
}
