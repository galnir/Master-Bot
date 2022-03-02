import Member from '../../lib/models/Member';
import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';

@ApplyOptions<CommandOptions>({
  name: 'display-playlist',
  description: 'Display a saved playlist',
  preconditions: ['userInDB', 'playlistExists']
})
export class DisplayPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    const queryObject = await Member.findOne({
      memberId: interactionMember.id
    }).select({ savedPlaylists: { $elemMatch: { name: playlistName } } });

    if (!queryObject.savedPlaylists[0].urls.length) {
      return interaction.reply(`**${playlistName}** is empty!`);
    }

    const baseEmbed = new MessageEmbed()

      .setTitle('Music Queue')
      .setColor('#9096e6')
      .setAuthor({
        name: interactionMember.user.username,
        iconURL: interactionMember.user.displayAvatarURL()
      });

    await interaction.reply(`**${playlistName}**:`);

    new PaginatedFieldMessageEmbed()
      .setTitleField('Custom Playlist')
      // @ts-ignore
      .setTemplate({ baseEmbed })
      .setItems(queryObject.savedPlaylists[0].urls)
      .formatItems((item: any) => `[${item.title}](${item.url})`)
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
      description: this.description,
      options: [
        {
          name: 'playlist-name',
          description: 'What is the name of the playlist you want to display?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
