import Member from '../../lib/models/Member';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import type { SavedPlaylist } from './create-playlist';

@ApplyOptions<CommandOptions>({
  name: 'my-playlists',
  description: "Display your custom playlists' names",
  preconditions: ['inVoiceChannel', 'userInDB']
})
export class MyPlaylistsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const interactionMember = interaction.member as GuildMember;

    const response = await Member.findOne(
      { memberId: interactionMember.id },
      'savedPlaylists.name'
    );

    if (!response.savedPlaylists.length) {
      return await interaction.reply('You have no saved playlists!');
    }

    const playlistNames = response.savedPlaylists.map(
      (playlist: SavedPlaylist) => playlist.name
    );

    const baseEmbed = new MessageEmbed()
      .setTitle('Music Queue')
      .setColor('#9096e6')
      .setAuthor({
        name: interactionMember.user.username,
        iconURL: interactionMember.user.displayAvatarURL()
      });

    await interaction.reply('Your playlists:');

    new PaginatedFieldMessageEmbed()
      .setTitleField('Custom Playlist')
      // @ts-ignore
      .setTemplate({ baseEmbed })
      .setItems(playlistNames)
      .setItemsPerPage(5)
      .make()
      // @ts-ignore
      .run(interaction);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
