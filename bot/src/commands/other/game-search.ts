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
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'game-search',
  description: 'Search for video game information',
  preconditions: ['isCommandDisabled']
})
export class GameSearchCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    if (!data.rawgAPI)
      return await interaction.reply(
        ':x: Command is Disabled - Missing API Key'
      );
    const title = interaction.options.getString('game', true);
    const filteredTitle = this.filterTitle(title);

    try {
      var game = await this.getGameDetails(filteredTitle);
    } catch (error: any) {
      return await interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    const firstPageTuple: string[] = []; // releaseDate, esrbRating, userRating

    if (game.tba) {
      firstPageTuple.push('TBA');
    } else if (!game.released) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(game.released);
    }

    if (!game.esrb_rating) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(game.esrb_rating.name);
    }

    if (!game.rating) {
      firstPageTuple.push('None Listed');
    } else {
      firstPageTuple.push(game.rating + '/5');
    }

    PaginatedEmbed.addPageEmbed(embed =>
      embed
        .setTitle(`Game Info: ${game.name}`)
        .setDescription(
          '>>> ' +
            '**Game Description**\n' +
            game.description_raw.slice(0, 2000) +
            '...'
        )
        .setColor('#B5B5B5')
        .setThumbnail(game.background_image)
        .addField('Released', '> ' + firstPageTuple[0], true)
        .addField('ESRB Rating', '> ' + firstPageTuple[1], true)
        .addField('Score', '> ' + firstPageTuple[2], true)
        .setTimestamp()
    );

    const developerArray: string[] = [];
    if (game.developers.length) {
      for (let i = 0; i < game.developers.length; ++i) {
        developerArray.push(game.developers[i].name);
      }
    } else {
      developerArray.push('None Listed');
    }

    const publisherArray: string[] = [];
    if (game.publishers.length) {
      for (let i = 0; i < game.publishers.length; ++i) {
        publisherArray.push(game.publishers[i].name);
      }
    } else {
      publisherArray.push('None Listed');
    }

    const platformArray: string[] = [];
    if (game.platforms.length) {
      for (let i = 0; i < game.platforms.length; ++i) {
        platformArray.push(game.platforms[i].platform.name);
      }
    } else {
      platformArray.push('None Listed');
    }

    const genreArray: string[] = [];
    if (game.genres.length) {
      for (let i = 0; i < game.genres.length; ++i) {
        genreArray.push(game.genres[i].name);
      }
    } else {
      genreArray.push('None Listed');
    }

    const retailerArray: string[] = [];
    if (game.stores.length) {
      for (let i = 0; i < game.stores.length; ++i) {
        retailerArray.push(
          `[${game.stores[i].store.name}](${game.stores[i].url})`
        );
      }
    } else {
      retailerArray.push('None Listed');
    }

    PaginatedEmbed.addPageEmbed(embed =>
      embed
        .setTitle(`Game Info: ${game.name}`)
        .setColor('#b5b5b5')
        .setThumbnail(game.background_image_additional ?? game.background_image)
        // Row 1
        .addField(
          developerArray.length == 1 ? 'Developer' : 'Developers',
          '> ' + developerArray.toString().replace(/,/g, ', '),
          true
        )
        .addField(
          publisherArray.length == 1 ? 'Publisher' : 'Publishers',
          '> ' + publisherArray.toString().replace(/,/g, ', '),
          true
        )
        .addField(
          platformArray.length == 1 ? 'Platform' : 'Platforms',
          '> ' + platformArray.toString().replace(/,/g, ', '),
          true
        )
        // Row 2
        .addField(
          genreArray.length == 1 ? 'Genre' : 'Genres',
          '> ' + genreArray.toString().replace(/,/g, ', '),
          true
        )
        .addField(
          retailerArray.length == 1 ? 'Retailer' : 'Retailers',
          '> ' + retailerArray.toString().replace(/,/g, ', ').replace(/`/g, '')
        )
        .setTimestamp()
    );
    if (PaginatedEmbed.actions.size > 0)
      PaginatedEmbed.actions.delete('@sapphire/paginated-messages.goToPage');
    return PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ): void {
    if (!data.rawgAPI) {
      Logger.info('Game-Search-Command - Disabled');
      return;
    } else Logger.info('Game-Search-Command - Enabled');
    registry.registerChatInputCommand({
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
      const url = `https://api.rawg.io/api/games/${encodeURIComponent(
        query
      )}?key=${data.rawgAPI}`;
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
            ':x: There was a problem getting game from the API, make sure you entered a valid game tittle'
          );
        }

        let body = response.data;
        if (body.redirect) {
          const redirect = await axios.get(
            `https://api.rawg.io/api/games/${body.slug}?key=${data.rawgAPI}`
          );
          body = redirect.data;
        }
        // 'id' is the only value that must be present to all valid queries
        if (!body.id) {
          reject(
            ':x: There was a problem getting data from the API, make sure you entered a valid game title'
          );
        }
        resolve(body);
      } catch (e) {
        Logger.error(e);
        reject(
          'There was a problem getting data from the API, make sure you entered a valid game title'
        );
      }
    });
  }
}
