import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'about',
  description: 'Display info on the bot and its creator!'
})
export class AboutCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    return await interaction.reply(
      'Made by @hyperzone#1185 with :heart: code is available on GitHub https://github.com/galnir/Master-Bot'
    );
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand(
      {
        name: this.name,
        description: this.description
      },
      {
        guildIds: ['336505000828076032']
      }
    );
  }
}
