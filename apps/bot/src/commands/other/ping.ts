import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'ping',
  description: 'Replies with Pong!',
  preconditions: ['isCommandDisabled']
})
export class PingCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const ping = interaction.createdTimestamp - Date.now();
    const apiPing = Math.round(interaction.client.ws.ping);
    return await interaction.reply(
      `Pong! - Bot Latency: ${ping}ms - API Latency: ${apiPing}ms - Round Trip: ${
        ping + apiPing
      }ms`
    );
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
