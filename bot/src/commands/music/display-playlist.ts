import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'display-playlist',
  description: 'Display a saved playlist',
  preconditions: ['GuildOnly', 'userInDB', 'playlistExists']
})
export class DisplayPlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    const response = await axios.get('http://localhost:1212/playlist', {
      params: { name: playlistName, id: interactionMember.id }
    });
    console.log(response.data);
    const { playlist } = response.data;

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