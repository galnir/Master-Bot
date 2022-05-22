import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'create-playlist',
  description: 'Create a custom playlist that you can play anytime',
  preconditions: ['GuildOnly', 'userInDB', 'playlistNotDuplicate']
})
export class CreatePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    let playlist;

    try {
      playlist = await prisma.playlist.create({
        data: {
          name: playlistName,
          user: { connect: { id: interactionMember.id } }
        }
      });
    } catch (error) {
      await interaction.reply({
        content: `:x: You already have a playlist named **${playlistName}**`
      });
      return;
    }

    await interaction.reply(`Created a playlist named **${playlist.name}**`);
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
          description: 'What is the name of the playlist you want to create?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
