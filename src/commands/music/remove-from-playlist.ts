import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'remove-from-playlist',
  description: 'Remove a song from a saved playlist',
  preconditions: ['GuildOnly', 'userInDB', 'playlistExists']
})
export class RemoveFromPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const playlistName = interaction.options.getString('playlist-name', true);
    const location = interaction.options.getInteger('location', true);

    const interactionMember = interaction.member as GuildMember;

    let playlist;
    try {
      playlist = await prisma.playlist.findFirst({
        where: {
          userId: interactionMember.id,
          name: playlistName
        },
        select: {
          songs: true
        }
      });
    } catch (error) {
      return await interaction.followUp(':x: Something went wrong!');
    }

    const songs = playlist?.songs;

    if (!songs?.length) {
      return await interaction.followUp(`:x: **${playlistName}** is empty!`);
    }

    if (location > songs.length || location < 0) {
      return await interaction.followUp(':x: Please enter a valid index!');
    }

    const id = songs[location - 1].id;

    let song;
    try {
      song = await prisma.song.delete({
        where: {
          id
        }
      });
    } catch (error) {
      return await interaction.followUp(':x: Something went wrong!');
    }

    if (!song) {
      return await interaction.followUp(':x: Something went wrong!');
    }

    await interaction.followUp(
      `:wastebasket: Deleted **${song.name}** from **${playlistName}**`
    );
    return;
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
          description:
            'What is the name of the playlist you want to remove from?',
          type: 'STRING',
          required: true
        },
        {
          name: 'location',
          description:
            'What is the index of the video you would like to delete from your saved playlist?',
          type: 'INTEGER',
          required: true // todo: not required so if a song is playing it can be saved
        }
      ]
    });
  }
}
