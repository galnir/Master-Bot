import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'create-playlist',
  description: 'Create a custom playlist that you can play anytime',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistNotDuplicate'
  ]
})
export class CreatePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    try {
      const playlist = await trpcNode.playlist.create.mutate({
        name: playlistName,
        userId: interactionMember.id
      });

      if (!playlist) throw new Error();
    } catch (error) {
      await interaction.reply({
        content: `:x: You already have a playlist named **${playlistName}**`
      });
      return;
    }

    await interaction.reply(`Created a playlist named **${playlistName}**`);
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
          description: 'What is the name of the playlist you want to create?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
