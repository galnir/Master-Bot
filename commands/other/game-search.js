const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { PagesBuilder } = require('discord.js-pages');
const { rawgAPI } = require('../../config.json');

if (!rawgAPI) return;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game-search')
    .setDescription('Search for game information')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('What game are you looking for?')
        .setRequired(true)
    ),
  async execute(interaction) {
    const gameTitleFiltered = interaction.options
      .get('game')
      .value.replace(/ /g, '-')
      .replace(/'/g, '')
      .toLowerCase();

    // using this link it provides all the info, instead of using search
    try {
      var response = await getGameDetails(gameTitleFiltered);
    } catch (error) {
      return interaction.reply(error);
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

    const embed = new PagesBuilder(interaction)
      .setPages(embedArray)
      .setTitle(response.name)
      .setColor(`#b5b5b5`);
    if (response.background_image) {
      embed.setThumbnail(response.background_image);
    }
    embed.build();
  }
};

function getGameDetails(query) {
  return new Promise(async function(resolve, reject) {
    const url = `https://api.rawg.io/api/games/${query}?key=${rawgAPI}`;
    try {
      const body = await fetch(url);
      if (body.status == `429`) {
        reject(':x: Rate Limit exceeded. Please try again in a few minutes.');
      }
      if (body.status == `503`) {
        reject(
          ':x: The service is currently unavailable. Please try again later.'
        );
      }
      if (body.status == '404') {
        reject(`:x: Error: ${query} was not found`);
      }
      if (body.status !== 200) {
        reject(
          ':x: There was a problem getting data from the API, make sure you entered a valid game tittle'
        );
      }

      let data = await body.json();
      if (data.redirect) {
        const redirect = await fetch(
          `https://api.rawg.io/api/games/${body.slug}?key=${rawgAPI}`
        );
        data = await redirect.json();
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
