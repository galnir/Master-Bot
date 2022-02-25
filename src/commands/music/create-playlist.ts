import Member from '../../lib/models/Member';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';

export interface SavedPlaylist {
  name: String;
  urls: String[];
}

@ApplyOptions<CommandOptions>({
  name: 'create-playlist',
  description: 'Create a custom playlist that you can play anytime',
  preconditions: ['inVoiceChannel', 'userInDB', 'playlistNotDuplicate']
})
export class CreatePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;
    try {
      const member = await Member.findOne({ memberId: interactionMember.id });
      const savedPlaylists = member.savedPlaylists;

      savedPlaylists.push({
        name: playlistName,
        urls: []
      });

      await Member.updateOne(
        { memberId: interactionMember.id },
        {
          savedPlaylists
        }
      );

      return interaction.reply(`Created a playlist named **${playlistName}**`);
    } catch (err) {
      console.error(err);
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
          description: 'What is the name of the playlist you want to create?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
