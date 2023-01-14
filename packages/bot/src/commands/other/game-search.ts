import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'game-search',
  description: 'Search for video game information',
  preconditions: ['isCommandDisabled']
})
export class GameSearchCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    if (!process.env.RAWG_API)
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
        .addFields(
          { name: 'Released', value: '> ' + firstPageTuple[0], inline: true },
          {
            name: 'ESRB Rating',
            value: '> ' + firstPageTuple[1],
            inline: true
          },
          { name: 'Score', value: '> ' + firstPageTuple[2], inline: true }
        )
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
        .addFields(
          {
            name: developerArray.length == 1 ? 'Developer' : 'Developers',
            value: '> ' + developerArray.toString().replace(/,/g, ', '),
            inline: true
          },
          {
            name: publisherArray.length == 1 ? 'Publisher' : 'Publishers',
            value: '> ' + publisherArray.toString().replace(/,/g, ', '),
            inline: true
          },
          {
            name: platformArray.length == 1 ? 'Platform' : 'Platforms',
            value: '> ' + platformArray.toString().replace(/,/g, ', '),
            inline: true
          }
        )
        // Row 2
        .addFields(
          {
            name: genreArray.length == 1 ? 'Genre' : 'Genres',
            value: '> ' + genreArray.toString().replace(/,/g, ', '),
            inline: true
          },
          {
            name: retailerArray.length == 1 ? 'Retailer' : 'Retailers',
            value:
              '> ' +
              retailerArray.toString().replace(/,/g, ', ').replace(/`/g, '')
          }
        )
        .setTimestamp()
    );
    if (PaginatedEmbed.actions.size > 0)
      PaginatedEmbed.actions.delete('@sapphire/paginated-messages.goToPage');
    return PaginatedEmbed.run(interaction);
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    if (!process.env.RAWG_API) {
      Logger.info('Game-Search-Command - Disabled');
      return;
    } else Logger.info('Game-Search-Command - Enabled');

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('game')
            .setDescription('What game do you want to look up?')
            .setRequired(true)
        )
    );
  }

  private filterTitle(title: string) {
    return title.replace(/ /g, '-').replace(/' /g, '').toLowerCase();
  }

  private getGameDetails(query: string): Promise<any> {
    return new Promise(async function (resolve, reject) {
      const url = `https://api.rawg.io/api/games/${encodeURIComponent(
        query
      )}?key=${process.env.RAWG_API}`;
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
            `https://api.rawg.io/api/games/${body.slug}?key=${process.env.RAWG_API}`
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
