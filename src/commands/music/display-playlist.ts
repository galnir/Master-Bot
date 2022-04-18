import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'display-playlist',
  description: 'Display a saved playlist',
  preconditions: ['userInDB', 'playlistExists']
})
export class DisplayPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    const playlist = await prisma.playlist.findFirst({
      where: {
        userId: interactionMember.id,
        name: playlistName
      },
      select: {
        songs: true
      }
    });

    if (!playlist) {
      return await interaction.reply(
        'Something went wrong! Please try again soon'
      );
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
      .setItems(playlist.songs)
      .formatItems((item: any) => `[${item.name}](${item.url})`)
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
