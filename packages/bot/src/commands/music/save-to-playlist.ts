import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import searchSong from '../../lib/utils/music/searchSong';
import Logger from '../../lib/utils/logger';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'save-to-playlist',
  description: 'Salvar uma música ou uma playlist em uma playlist personalizada',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistExists'
  ]
})
export class SaveToPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const playlistName = interaction.options.getString('playlist-name', true);
    const url = interaction.options.getString('url', true);

    const interactionMember = interaction.member as GuildMember;

    const playlistQuery = await trpcNode.playlist.getPlaylist.query({
      name: playlistName,
      userId: interactionMember.id
    });

    if (!playlistQuery.playlist) {
      return await interaction.followUp('Playlist não existente');
    }

    const playlistId = playlistQuery.playlist.id;

    const songTuple = await searchSong(url, interaction.user);
    if (!songTuple[1].length) {
      return await interaction.followUp(songTuple[0]);
    }

    const songArray = songTuple[1];
    const songsToAdd = [];

    for (let i = 0; i < songArray.length; i++) {
      const song = songArray[i];
      delete song['requester'];
      songsToAdd.push({
        ...song,
        playlistId: +playlistId
      });
    }

    try {
      await trpcNode.song.createMany.mutate({
        songs: songsToAdd
      });

      return await interaction.followUp(`Músicas adicionadas na **${playlistName}**`);
    } catch (error) {
      Logger.error(error);
      return await interaction.followUp(':x: Alguma coisa deu errada!');
    }
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
          description: 'Qual é o nome da playlist que você quer salvar?',
          type: 'STRING',
          required: true
        },
        {
          name: 'url',
          description: 'O que você quer salvar na playlist personalizada?',
          type: 'STRING',
          required: true // todo: not required so if a song is playing it can be saved
        }
      ]
    });
  }
}
