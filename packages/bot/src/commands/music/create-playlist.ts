import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
  name: 'create-playlist',
  description: 'Criar uma Playlist personalizada que você pode tocar qualquer hora!',
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
      const playlist = await trpcNode.playlist.create.mutate({
        name: playlistName,
        userId: interactionMember.id
      });

      if (!playlist) throw new Error();
    } catch (error) {
      await interaction.reply({
        content: `:x: Você já deu esse nome para uma playlist! **${playlistName}**`
      });
      return;
    }

    await interaction.reply(`Playlist **${playlistName}** Criada!`);
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
          description: 'Qual o nome da playlist que você quer criar?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }
}
