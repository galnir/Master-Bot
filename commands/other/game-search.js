const { SlashCommandBuilder } = require('@discordjs/builders');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');
const fetch = require('node-fetch');
const { rawgAPI } = require('../../config.json');

if (!rawgAPI) return; // don't load the command if no rawg api key in config.json

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game-search')
    .setDescription('Search for a video game information')
    .addStringOption(option =>
      option
        .setName('game')
        .setDescription('What video game are you looking for?')
        .setRequired(true)
    ),
  async execute(interaction) {
    const title = interaction.options.get('game').value;
    const filteredTitle = filterTitle(title);

    try {
      var data = await getGameDetails(filteredTitle);
    } catch (error) {
      return interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    const firstPageTuple = []; // releaseDate, esrbRating, userRating

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
        .setDescription(
          '**Game Description**\n' + data.description_raw.slice(0, 2000) + '...'
        )
        .addField('Released', firstPageTuple[0], true)
        .addField('ESRB Rating', firstPageTuple[1], true)
        .addField('Score', firstPageTuple[2], true)
    );

    const developerArray = [];
    if (data.developers.length) {
      for (let i = 0; i < data.developers.length; ++i) {
        developerArray.push(data.developers[i].name);
      }
    } else {
      developerArray.push('None Listed');
    }

    const publisherArray = [];
    if (data.publishers.length) {
      for (let i = 0; i < data.publishers.length; ++i) {
        publisherArray.push(data.publishers[i].name);
      }
    } else {
      publisherArray.push('None Listed');
    }

    const platformArray = [];
    if (data.platforms.length) {
      for (let i = 0; i < data.platforms.length; ++i) {
        platformArray.push(data.platforms[i].platform.name);
      }
    } else {
      platformArray.push('None Listed');
    }

    const genreArray = [];
    if (data.genres.length) {
      for (let i = 0; i < data.genres.length; ++i) {
        genreArray.push(data.genres[i].name);
      }
    } else {
      genreArray.push('None Listed');
    }

    const retailerArray = [];
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
      embed // Row 1
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
    );

    const message = {
      author: {
        id: interaction.member.id,
        bot: interaction.user.bot
      },
      channel: interaction.channel
    };

    await interaction.reply('Game info:');
    PaginatedEmbed.run(message);
  }
};

function filterTitle(title) {
  return title.replace(/ /g, '-').replace(/' /g, '').toLowerCase();
}

function getGameDetails(query) {
  return new Promise(async function (resolve, reject) {
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
