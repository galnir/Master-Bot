import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import searchSong from '../../lib/utils/music/searchSong';
import type { Addable } from '../../lib/utils/queue/Queue';
import type { Track } from '@lavaclient/types';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'save-to-playlist',
  description: 'Save a song or a playlist to a custom playlist',
  preconditions: ['GuildOnly', 'userInDB', 'playlistExists']
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

    const songTuple = await searchSong(url);
    if (!songTuple[1].length) {
      return await interaction.followUp(songTuple[0]);
    }

    const songArray = songTuple[1] as Addable[];
    const songsToAdd = [];

    for (let i = 0; i < songArray.length; i++) {
      const song = songArray[i] as Track;
      songsToAdd.push({
        name: song.info.title,
        url: song.info.uri,
        playlistId: +playlistId!.id
      });
    }

    try {
      await prisma.song.createMany({
        data: songsToAdd
      });

      return await interaction.followUp(`Added tracks to **${playlistName}**`);
    } catch (error) {
      return await interaction.followUp(':x: Something went wrong!');
    }
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
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
