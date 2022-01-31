import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { container } from '@sapphire/framework';
import { GeniusLyrics } from 'genius-discord-lyrics';
import * as data from '../../config.json';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

const genius = new GeniusLyrics(data.geniusLyricsAPI);

@ApplyOptions<CommandOptions>({
  name: 'lyrics',
  description:
    'Get the lyrics of any song or the lyrics of the currently playing song!',
  preconditions: ['musicTriviaPlaying']
})
export class LyricsCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    let title = interaction.options.getString('title');

    const player = client.music.players.get(interaction.guild!.id);

    await interaction.deferReply();

    if (!title) {
      if (!player) {
        return await interaction.followUp(
          'Please provide a valid song name or start playing one and try again!'
        );
      }
      title = player.queue.current?.title as string;
    }

    try {
      const lyrics = (await genius.fetchLyrics(title)) as string;
      const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
      const paginatedLyrics = new PaginatedMessage({
        template: new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(title)
          .setFooter({ text: 'Provided by genius.com' })
      });

      for (let i = 1; i <= lyricsIndex; ++i) {
        let b = i - 1;
        if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
          paginatedLyrics.addPageEmbed(embed => {
            return embed.setDescription(lyrics.slice(b * 4096, i * 4096));
          });
        }
      }
      const message = {
        author: {
          id: interaction.user.id,
          bot: interaction.user.bot
        },
        channel: interaction.channel
      };
      await interaction.followUp('Lyrics generated');
      // @ts-ignore
      return paginatedLyrics.run(message);
    } catch (e) {
      console.log(e);
      return interaction.followUp(
        'Something when wrong when trying to fetch lyrics :('
      );
    }
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'title',
          description: ':mag: What song lyrics would you like to get?',
          type: 'STRING'
        }
      ]
    });
  }
}
