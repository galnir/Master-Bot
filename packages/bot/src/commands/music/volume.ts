import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
  name: 'volume',
  description: 'Muda o volume!',
  preconditions: [
    'GuildOnly',
    'isCommandDisabled',
    'inVoiceChannel',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class VolumeCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const query = interaction.options.getNumber('setting', true);

    const queue = client.music.queues.get(interaction.guildId!);

    if (query > 200 || query < 0) {
      return await interaction.reply(':x: O volume deve estar entre 0 e 200!');
    }

    await queue.setVolume(query);

    return await interaction.reply(
      `:white_check_mark: Volume foi para ${query}!`
    );
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption(option =>
          option
            .setName('setting')
            .setDescription('What Volume? (0 to 200)')
            .setRequired(true)
        )
    );
  }
}
