const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Pagination = require('discord-paginationembed');
const fetch = require('node-fetch');
const { rawgAPI } = require('../../config.json');

if (!rawgAPI) return;

module.exports = class GameSearchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'game-search',
      aliases: ['gs'],
      memberName: 'game-search',
      group: 'other',
      description: 'Display game information ',
      args: [
        {
          key: 'gameQuery',
          prompt: 'What game are you looking for?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { gameQuery }) {
    let gameTitleFiltered = gameQuery
      .replace(/ /g, '-')
      .replace(/'/g, '')
      .toLowerCase();

    // using this link it provides all the info, instead of using search
    let initialGame = await fetch(
      `https://api.rawg.io/api/games/${gameTitleFiltered}?key=${rawgAPI}`
    );
    let response = await initialGame.json();

    if (response.detail === 'Not found. ') {
      message.channel.send(`:x: Error: ${gameQuery} was not found`);
      return;
    }
    if (response.redirect) {
      initialGame = await fetch(
        `https://api.rawg.io/api/games/${response.slug}?key=${rawgAPI}`
      );
      response = await initialGame.json();
    }

    let releaseDate;
    if (response.tba) {
      releaseDate = 'TBA';
    } else if (response.released == null) {
      releaseDate = 'None Listed.';
    } else {
      releaseDate = response.released;
    }

    let esrbRating;
    if (response.esrb_rating == null) {
      esrbRating = 'None Listed.';
    } else {
      esrbRating = response.esrb_rating.name;
    }

    let userRating;
    if (response.rating == null) {
      userRating = 'None Listed.';
    } else {
      userRating = response.rating + '/5';
    }

    const embedArray = [
      // Page 1
      new MessageEmbed()
        .setDescription(
          '**Game Description**\n' +
            response.description_raw.slice(0, 2000) +
            '...'
        )
        .addField('Released', releaseDate, true)
        .addField('ESRB Rating', esrbRating, true)
        .addField('Score', userRating, true)
    ];

    const developerArray = [];
    if (response.developers.length > 0) {
      for (let i = 0; i < response.developers.length; ++i) {
        developerArray.push(response.developers[i].name);
      }
    } else {
      developerArray.push('None Listed.');
    }

    const publisherArray = [];
    if (response.publishers.length > 0) {
      for (let i = 0; i < response.publishers.length; ++i) {
        publisherArray.push(response.publishers[i].name);
      }
    } else {
      publisherArray.push('None Listed.');
    }

    const platformArray = [];
    if (response.platforms.length > 0) {
      for (let i = 0; i < response.platforms.length; ++i) {
        platformArray.push(response.platforms[i].platform.name);
      }
    } else {
      platformArray.push('None Listed.');
    }

    const genreArray = [];
    if (response.genres.length > 0) {
      for (let i = 0; i < response.genres.length; ++i) {
        genreArray.push(response.genres[i].name);
      }
    } else {
      genreArray.push('None Listed.');
    }

    const retailerArray = [];
    if (response.stores.length > 0) {
      for (let i = 0; i < response.stores.length; ++i) {
        retailerArray.push(
          `[${response.stores[i].store.name}](${response.stores[i].url})`
        );
      }
    } else {
      retailerArray.push('None Listed.');
    }

    embedArray.push(
      // Page 2
      new MessageEmbed()
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
          retailerArray
            .toString()
            .replace(/,/g, ', ')
            .replace(/`/g, '')
        )
    );

    const embed = new Pagination.Embeds()
      .setArray(embedArray)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setTitle(response.name)
      .setColor(`#b5b5b5`);
    if (response.background_image) {
      embed.setThumbnail(response.background_image);
    }
    embed.build();
  }
};
