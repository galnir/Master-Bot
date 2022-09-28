import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'my-playlists',
  description: "Display your custom playlists' names",
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'userInDB'
  ]
})
export class MyPlaylistsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const interactionMember = interaction.member as GuildMember;

    const baseEmbed = new MessageEmbed().setColor('#9096e6').setAuthor({
      name: `${interactionMember.user.username}`,
      iconURL: interactionMember.user.displayAvatarURL()
    });

    const playlistsQuery = await trpcNode.playlist.getAll.query({
      userId: interactionMember.id
    });

    if (!playlistsQuery || !playlistsQuery.playlists.length) {
      return await interaction.reply(':x: You have no custom playlists');
    }

    new PaginatedFieldMessageEmbed()
      .setTitleField('Custom Playlists')
      .setTemplate(baseEmbed)
      .setItems(playlistsQuery.playlists)
      .formatItems((playlist: any) => playlist.name)
      .setItemsPerPage(5)
      .make()
      .run(interaction);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
