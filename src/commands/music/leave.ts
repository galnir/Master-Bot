import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'leave',
  description: 'Make the bot leave its voice channel and stop playing music',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class LeaveCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    await interaction
      .channel!.fetch()
      .then(
        async channel =>
          await channel.messages.fetch(
            client.playerEmbeds[interaction.guild!.id]
          )
      )
      .then(async oldMessage => {
        await oldMessage
          .delete()
          .catch(error => console.log('Failed to Delete Old Message.', error));
      });
    const player = client.music.players.get(interaction.guild!.id);
    player?.disconnect();
    client.music.destroyPlayer(player!.guildId);
    return await interaction.reply('Leaving voice channel');
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
