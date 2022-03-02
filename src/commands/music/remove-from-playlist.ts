import Member from '../../lib/models/Member';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'remove-from-playlist',
  description: 'Remove a song from a saved playlist',
  preconditions: ['userInDB', 'playlistExists']
})
export class RemoveFromPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const playlistName = interaction.options.getString('playlist-name', true);
    const location = interaction.options.getInteger('location', true);

    const interactionMember = interaction.member as GuildMember;
    try {
      const memberData = await Member.findOne({
        memberId: interactionMember.id,
        'savedPlaylists.name': playlistName
      });

      const savedPlaylistsClone = memberData.savedPlaylists;
      if (!savedPlaylistsClone.length) {
        return await interaction.followUp({
          content: 'You have no custom playlists!',
          ephemeral: true
        });
      }

      let found = false;
      let index = 0;

      for (let i = 0; i < savedPlaylistsClone.length; i++) {
        if (savedPlaylistsClone[i].name == playlistName) {
          found = true;
          index = i;
          break;
        }
      }
      if (found) {
        const urlsArrayClone = savedPlaylistsClone[index].urls;
        if (!urlsArrayClone.length) {
          return await interaction.followUp({
            content: `**${playlistName}** is empty!`
          });
        }

        if (location > urlsArrayClone.length) {
          return await interaction.followUp('Please provide a valid location!');
        }

        const title = urlsArrayClone[location - 1].title;
        urlsArrayClone.splice(location - 1, 1);
        savedPlaylistsClone[index].urls = urlsArrayClone;

        await Member.updateOne(
          {
            memberId: interactionMember.id
          },
          { savedPlaylists: savedPlaylistsClone }
        );

        return await interaction.followUp({
          content: `Removed **${title}**`,
          ephemeral: true
        });
      } else {
        return await interaction.followUp({
          content: 'Something went wrong!',
          ephemeral: true
        });
      }
    } catch (err) {
      console.error(err);
      return await interaction.followUp({
        content: 'Something went wrong!',
        ephemeral: true
      });
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
