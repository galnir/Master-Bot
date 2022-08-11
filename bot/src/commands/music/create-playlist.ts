import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import axios from 'axios';
import type { CommandInteraction, GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'create-playlist',
  description: 'Create a custom playlist that you can play anytime',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'userInDB',
    'playlistNotDuplicate'
  ]
})
export class CreatePlaylistCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const playlistName = interaction.options.getString('playlist-name', true);

    const interactionMember = interaction.member as GuildMember;

    try {
      await axios.post('http://localhost:1212/playlist', null, {
        params: { name: playlistName, id: interactionMember.id }
      });
    } catch (error) {
      await interaction.reply({
        content: `:x: You already have a playlist named **${playlistName}**`
      });
      return;
    }

    await interaction.reply(`Created a playlist named **${playlistName}**`);
    return;
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
          description: 'What is the name of the playlist you want to create?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
