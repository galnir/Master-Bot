import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import prisma from '../../lib/prisma';

@ApplyOptions<CommandOptions>({
  name: 'my-playlists',
  description: "Display your custom playlists' names",
  preconditions: ['GuildOnly', 'inVoiceChannel', 'userInDB']
})
export class MyPlaylistsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const interactionMember = interaction.member as GuildMember;

    const baseEmbed = new MessageEmbed().setColor('#9096e6').setAuthor({
      name: `${interactionMember.user.username}`,
      iconURL: interactionMember.user.displayAvatarURL()
    });

    const playlists = await prisma.playlist.findMany({
      where: {
        userId: interactionMember.id
      },
      select: {
        name: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    if (!playlists.length) {
      return await interaction.reply(':x: You have no custom playlists');
    }

    new PaginatedFieldMessageEmbed()
      .setTitleField('Custom Playlists')
      .setTemplate(baseEmbed)
      .setItems(playlists)
      .formatItems((playlist: any) => playlist.name)
      .setItemsPerPage(5)
      .make()
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
