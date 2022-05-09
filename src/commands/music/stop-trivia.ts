import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'stop-trivia',
  description: 'End a music trivia',
  preconditions: ['GuildOnly']
})
export class StopTriviaCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guildId as string);

    if (!player) {
      return await interaction.reply(
        'There is no trivia playing at the moment!'
      );
    }

    if (!player.triviaQueue.current) {
      return await interaction.reply(
        'There is no trivia playing at the moment!'
      );
    }

    player!.triviaQueue.wasTriviaEndCalled = true;

    player!.triviaQueue.collector?.stop(); // emits the end event

    await interaction.reply('Trivia ended!');
    return;
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
