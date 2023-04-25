import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'my-playlists',
  description: "Exibir os nomes da sua playlists personalizadas",
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'userInDB'
  ]
})
export class MyPlaylistsCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const interactionMember = interaction.member?.user;

    if (!interactionMember) {
      return await interaction.reply({
        content: ':x: Something went wrong! Please try again later'
      });
    }

    const baseEmbed = new EmbedBuilder().setColor('Purple').setAuthor({
      name: `${interactionMember.username}`,
      iconURL: interactionMember.avatar || undefined
    });

    const playlistsQuery = await trpcNode.playlist.getAll.query({
      userId: interactionMember.id
    });

    if (!playlistsQuery || !playlistsQuery.playlists.length) {
      return await interaction.reply(':x: Você não tem playlists personalizadas');
    }

    new PaginatedFieldMessageEmbed()
      .setTitleField('Custom Playlists')
      .setTemplate(baseEmbed)
      .setItems(playlistsQuery.playlists)
      .formatItems((playlist: any) => playlist.name)
      .setItemsPerPage(5)
      .make()
      .run(interaction);

    return;
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description
    });
  }
}
