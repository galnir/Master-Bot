import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import searchSong from '../../lib/utils/music/searchSong';
import prisma from '../../lib/prisma';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'save-to-playlist',
  description: 'Save a song or a playlist to a custom playlist',
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

    const playlistId = await prisma.playlist.findFirst({
      where: {
        userId: interactionMember.id,
        name: playlistName
      },
      select: {
        id: true
      }
    });

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
        playlistId: +playlistId!.id
      });
    }

    try {
      await prisma.song.createMany({
        data: songsToAdd
      });

      return await interaction.followUp(`Added tracks to **${playlistName}**`);
    } catch (error) {
      Logger.error(error);
      return await interaction.followUp(':x: Something went wrong!');
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
          description: 'What is the name of the playlist you want to save to?',
          type: 'STRING',
          required: true
        },
        {
          name: 'url',
          description: 'What do you want to save to the custom playlist?',
          type: 'STRING',
          required: true // todo: not required so if a song is playing it can be saved
        }
      ]
    });
  }
}
