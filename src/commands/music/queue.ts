import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { container } from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';

@ApplyOptions<CommandOptions>({
  name: 'queue',
  description: 'Display the music queue in the form of an embed',
  preconditions: [
    'GuildOnly',
    'inVoiceChannel',
    'musicTriviaPlaying',
    'playerIsPlaying',
    'inPlayerVoiceChannel'
  ]
})
export class QueueCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;

    const player = client.music.players.get(interaction.guild!.id);

    const queueLength = player!.queue.tracks.length;
    if (!queueLength) {
      return await interaction.reply('There are no songs in the queue!');
    }

    const queueItems = [];
    for (let i = 0; i < queueLength; i++) {
      queueItems.push({
        title: `${i + 1}`,
        value: player!.queue.tracks[i].title
      });
    }

    const user = interaction.user;

    const baseEmbed = new MessageEmbed()
      .setTitle('Music Queue')
      .setColor('#9096e6')
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL()
      });

    await interaction.reply('Queue generated');

    new PaginatedFieldMessageEmbed()
      .setTitleField('Queue items')

      .setTemplate(baseEmbed)
      .setItems(queueItems)
      .formatItems((item: any) => `${item.title}\n${item.value}`)
      .setItemsPerPage(5)
      .make()
      .run(interaction);
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
