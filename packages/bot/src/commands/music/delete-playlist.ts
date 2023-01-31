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
  description: 'Deleta uma das playlists que você criou!',
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
        ':x: Deu alguma coisa de errado, tenta mais tarde!'
      );
    }

    return await interaction.reply(`:wastebasket: Deletado **${playlistName}**`);
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
          description: 'Qual o nome da playlist que você quer deletar?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
