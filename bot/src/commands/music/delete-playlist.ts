import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'delete-playlist',
  description: 'Delete a playlist from your saved playlists',
  preconditions: ['GuildOnly', 'userInDB', 'playlistExists']
})
export class DeletePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    let deleted;

    try {
      deleted = await prisma.playlist.deleteMany({
        where: {
          userId: interactionMember.id,
          name: playlistName
        }
      });
    } catch (error) {
      console.error(error);
      return await interaction.reply(
        ':x: Something went wrong! Please try again later'
      );
    }

    if (deleted) {
      return await interaction.reply(
        `:wastebasket: Deleted **${playlistName}**`
      );
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
          description: 'What is the name of the playlist you want to delete?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
