import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'display-playlist',
  description: 'Display a saved playlist',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistExists'
  ]
})
export class DisplayPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    const playlistQuery = await trpcNode.playlist.getPlaylist.query({
      name: playlistName,
      userId: interactionMember.id
    });

    const { playlist } = playlistQuery;

    if (!playlist) {
      return await interaction.reply(
        ':x: Something went wrong! Please try again soon'
      );
    }

    const baseEmbed = new MessageEmbed().setColor('#9096e6').setAuthor({
      name: interactionMember.user.username,
      iconURL: interactionMember.user.displayAvatarURL()
    });

    new PaginatedFieldMessageEmbed()
      .setTitleField(`${playlistName} - Songs`)
      .setTemplate(baseEmbed)
      .setItems(playlist.songs)
      .formatItems((item: any) => `[${item.title}](${item.uri})`)
      .setItemsPerPage(5)
      .make()
      .run(interaction);
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
          description: 'What is the name of the playlist you want to display?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
