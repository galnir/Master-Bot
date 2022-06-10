import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import type { CommandInteraction } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';
import * as data from '../../config.json';

@ApplyOptions<CommandOptions>({
  name: 'game-search',
  description: 'Search for video game information'
})
export class GameSearchCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    if (!data.rawgAPI)
      return await interaction.reply(':x: Command is Disabled - Missing API Key');
    const title = interaction.options.getString('game', true);
    const filteredTitle = this.filterTitle(title);

    try {
      var data = await this.getGameDetails(filteredTitle);
    } catch (error: any) {
      return await interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    const firstPageTuple: string[] = []; // releaseDate, esrbRating, userRating

    if (data.tba) {
      firstPageTuple.push('TBA');
    } else if (!data.released) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(data.released);
    }

    if (!data.esrb_rating) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(data.esrb_rating.name);
    }

    if (!data.rating) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(data.rating + '/5');
    }

    PaginatedEmbed.addPageEmbed(embed =>
      embed
        .setTitle(`Game info: ${data.name}`)
        .setDescription(
          '**Game Description**\n' + data.description_raw.slice(0, 2000) + '...'
        )
        .setColor('#b5b5b5')
        .setThumbnail(data.background_image)
        .addField('Released', firstPageTuple[0], true)
        .addField('ESRB Rating', firstPageTuple[1], true)
        .addField('Score', firstPageTuple[2], true)
        .setTimestamp()
    );

    const developerArray: string[] = [];
    if (data.developers.length) {
      for (let i = 0; i < data.developers.length; ++i) {
        developerArray.push(data.developers[i].name);
      }
    } else {
      developerArray.push('None Listed');
    }

    const publisherArray: string[] = [];
    if (data.publishers.length) {
      for (let i = 0; i < data.publishers.length; ++i) {
        publisherArray.push(data.publishers[i].name);
      }
    } else {
      publisherArray.push('None Listed');
    }

    const platformArray: string[] = [];
    if (data.platforms.length) {
      for (let i = 0; i < data.platforms.length; ++i) {
        platformArray.push(data.platforms[i].platform.name);
      }
    } else {
      platformArray.push('None Listed');
    }

    const genreArray: string[] = [];
    if (data.genres.length) {
      for (let i = 0; i < data.genres.length; ++i) {
        genreArray.push(data.genres[i].name);
      }
    } else {
      genreArray.push('None Listed');
    }

    const retailerArray: string[] = [];
    if (data.stores.length) {
      for (let i = 0; i < data.stores.length; ++i) {
        retailerArray.push(
          `[${data.stores[i].store.name}](${data.stores[i].url})`
        );
      }
    } else {
      retailerArray.push('None Listed');
    }

    PaginatedEmbed.addPageEmbed(embed =>
      embed
        .setTitle(`Game info: ${data.name}`)
        .setColor('#b5b5b5')
        .setThumbnail(data.background_image_additional ?? data.background_image)
        // Row 1
        .addField(
          'Developer(s)',
          developerArray.toString().replace(/,/g, ', '),
          true
        )
        .addField(
          'Publisher(s)',
          publisherArray.toString().replace(/,/g, ', '),
          true
        )
        .addField(
          'Platform(s)',
          platformArray.toString().replace(/,/g, ', '),
          true
        )
        // Row 2
        .addField('Genre(s)', genreArray.toString().replace(/,/g, ', '), true)
        .addField(
          'Retailer(s)',
          retailerArray.toString().replace(/,/g, ', ').replace(/`/g, '')
        )
        .setTimestamp()
    );

    // await interaction.reply('');
    // @ts-ignore
    return PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    if (!data.rawgAPI) {
      return console.log('Game-Search-Command - Disabled');
    } else console.log('Game-Search-Command - Enabled');
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'game',
          description: 'What game do you want to look up?',
          required: true,
          type: 'STRING'
        }
      ]
    });
  }

  private filterTitle(title: string) {
    return title.replace(/ /g, '-').replace(/' /g, '').toLowerCase();
  }

  private getGameDetails(query: string): Promise<any> {
    return new Promise(async function (resolve, reject) {
      const url = `https://api.rawg.io/api/games/${query}?key=${data.rawgAPI}`;
      try {
        const response = await axios.get(url);
        if (response.status === 429) {
          reject(':x: Rate Limit exceeded. Please try again in a few minutes.');
        }
        if (response.status === 503) {
          reject(
            ':x: The service is currently unavailable. Please try again later.'
          );
        }
        if (response.status === 404) {
          reject(`:x: Error: ${query} was not found`);
        }
        if (response.status !== 200) {
          reject(
            ':x: There was a problem getting data from the API, make sure you entered a valid game tittle'
          );
        }

        let data = response.data;
        if (data.redirect) {
          const redirect = await axios.get(
            `https://api.rawg.io/api/games/${data.slug}?key=${data.rawgAPI}`
          );
          data = redirect.data;
        }
        // 'id' is the only value that must be present to all valid queries
        if (!data.id) {
          reject(
            ':x: There was a problem getting data from the API, make sure you entered a valid game title'
          );
        }
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          'There was a problem getting data from the API, make sure you entered a valid game title'
        );
      }
    });
  }
}
