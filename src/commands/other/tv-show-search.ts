import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'tv-show-search',
  description: 'Get TV shows information',
  preconditions: ['GuildOnly']
})
export class TVShowSearchCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const query = interaction.options.getString('query', true);

    try {
      var data = await this.getData(query);
    } catch (error: any) {
      return await interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    for (let i = 0; i < data.length; i++) {
      const showInfo = this.constructInfoObject(data[i].show);

      PaginatedEmbed.addPageEmbed(embed =>
        embed
          .setTitle(showInfo.name)
          .setURL(showInfo.url)
          .setColor('#17a589')
          .setThumbnail(showInfo.thumbnail)
          .setDescription(showInfo.summary)
          .addField('Language', showInfo.language, true)
          .addField('Genre(s)', showInfo.genres, true)
          .addField('Show Type', showInfo.type, true)
          .addField('Premiered', showInfo.premiered, true)
          .addField('Network', showInfo.network, true)
          .addField('Runtime', showInfo.runtime, true)
          .addField('Average Rating', showInfo.rating)
          .setFooter({
            text: `(Page ${i}/${data.length}) Powered by tvmaze.com`,
            iconURL: 'https://static.tvmaze.com/images/favico/favicon-32x32.png'
          })
      );
    }

    await interaction.reply('Show info');
    // @ts-ignore
    return PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'query',
          description: 'What TV show do you want to look up?',
          type: 'STRING',
          required: true
        }
      ]
    });
  }

  private getData(query: string): Promise<ResponseData> {
    return new Promise(async function (resolve, reject) {
      const url = `http://api.tvmaze.com/search/shows?q=${encodeURI(query)}`;
      try {
        const response = await axios.get(url);
        if (response.status == 429) {
          reject(':x: Rate Limit exceeded. Please try again in a few minutes.');
        }
        if (response.status == 503) {
          reject(
            ':x: The service is currently unavailable. Please try again later.'
          );
        }
        if (response.status !== 200) {
          reject(
            'There was a problem getting data from the API, make sure you entered a valid TV show name'
          );
        }
        const data = response.data;
        if (!data.length) {
          reject(
            'There was a problem getting data from the API, make sure you entered a valid TV show name'
          );
        }
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          'There was a problem getting data from the API, make sure you entered a valid TV show name'
        );
      }
    });
  }

  private constructInfoObject(show: any): InfoObject {
    return {
      name: show.name,
      url: show.url,
      summary: this.filterSummary(show.summary),
      language: this.checkIfNull(show.language),
      genres: this.checkGenres(show.genres),
      type: this.checkIfNull(show.type),
      premiered: this.checkIfNull(show.premiered),
      network: this.checkNetwork(show.network),
      runtime: show.runtime ? show.runtime + ' Minutes' : 'None Listed',
      rating: show.ratings ? show.rating.average : 'None Listed',
      thumbnail: show.image
        ? show.image.original
        : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
    };
  }

  private filterSummary(summary: string) {
    return summary
      .replace(/<(\/)?b>/g, '**')
      .replace(/<(\/)?i>/g, '*')
      .replace(/<(\/)?p>/g, '')
      .replace(/<br>/g, '\n')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'");
  }

  private checkGenres(genres: Genres) {
    if (Array.isArray(genres)) {
      if (genres.join(' ').trim().length == 0) return 'None Listed';
      return genres.join(' ');
    } else if (!genres.length) {
      return 'None Listed';
    }
    return genres;
  }

  private checkIfNull(value: string) {
    if (!value) {
      return 'None Listed';
    }
    return value;
  }

  private checkNetwork(network: any) {
    if (!network) return 'None Listed';
    return `(**${network.country.code}**) ${network.name}`;
  }
}

type InfoObject = {
  name: string;
  url: string;
  summary: string;
  language: string;
  genres: string;
  type: string;
  premiered: string;
  network: string;
  runtime: string;
  rating: string;
  thumbnail: string;
};

type Genres = string | Array<string>;

type ResponseData = string | Array<any>;
