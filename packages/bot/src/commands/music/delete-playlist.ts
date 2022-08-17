import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import axios from 'axios';
import type { CommandInteraction, GuildMember } from 'discord.js';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'delete-playlist',
  description: 'Delete a playlist from your saved playlists',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistExists'
  ]
})
export class DeletePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    let deleted: boolean = false;

    try {
      await axios.delete('http://localhost:1212/playlist', {
        params: { name: playlistName, userId: interactionMember.id }
      });
      deleted = true;
    } catch (error) {
      Logger.error(error);
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
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
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
