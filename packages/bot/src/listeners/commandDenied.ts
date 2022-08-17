import { ApplyOptions } from '@sapphire/decorators';
import {
  ChatInputCommandDeniedPayload,
  Listener,
  ListenerOptions,
  UserError
} from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
  name: 'chatInputCommandDenied'
})
export class CommandDeniedListener extends Listener {
  public override async run(
    { context, message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ): Promise<void> {
    return await interaction.reply({
      ephemeral: true,
      content: content
    });
  }
}
