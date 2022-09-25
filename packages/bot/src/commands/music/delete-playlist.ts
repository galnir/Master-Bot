import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import Logger from '../../lib/utils/logger';
import { trpcNode } from '../../trpc';

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

    try {
      const playlist = await trpcNode.playlist.delete.mutate({
        name: playlistName,
        userId: interactionMember.id
      });

      if (!playlist) throw new Error();
    } catch (error) {
      Logger.error(error);
      return await interaction.reply(
        ':x: Something went wrong! Please try again later'
      );
    }

    return await interaction.reply(`:wastebasket: Deleted **${playlistName}**`);
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
