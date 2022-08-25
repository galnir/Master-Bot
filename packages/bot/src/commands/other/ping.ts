import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'ping',
  description: 'Replies with Pong!',
  preconditions: ['isCommandDisabled']
})
export class PingCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const ping = interaction.createdTimestamp - Date.now();
    const apiPing = Math.round(interaction.client.ws.ping);
    return await interaction.reply(
      `Pong! - Bot Latency: ${ping}ms - API Latency: ${apiPing}ms - Round Trip: ${
        ping + apiPing
      }ms`
    );
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
