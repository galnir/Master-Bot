const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tv-show-search')
    .setDescription('Get TV shows information')
    .addStringOption(option =>
      option
        .setName('show-name')
        .setDescription(
          'What is the name of the tv show you would like to search?'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const showName = interaction.options.get('show-name').value;

    try {
      var data = await getData(showName);
    } catch (error) {
      return interaction.reply(error);
    }

    const PaginatedEmbed = new PaginatedMessage();

    for (let i = 0; i < data.length; i++) {
      const showInfo = constructInfoObject(data[i].show);
      PaginatedEmbed.addPageEmbed(embed =>
        embed
          .setTitle(showInfo.name)
          .setURL(showInfo.url)
          .setThumbnail(showInfo.thumbnail)
          .setDescription(showInfo.summary)
          .addField('Language', showInfo.language, true)
          .addField('Genre(s)', showInfo.genres, true)
          .addField('Show Type', showInfo.type, true)
          .addField('Premiered', showInfo.premiered, true)
          .addField('Network', showInfo.network, true)
          .addField('Runtime', showInfo.runtime, true)
          .addField('Average Rating', showInfo.rating)
          .setFooter(
            `(Page ${i}/${data.length}) Powered by tvmaze.com`,
            'https://static.tvmaze.com/images/favico/favicon-32x32.png'
          )
      );
    }

    const message = {
      author: {
        id: interaction.member.id,
        bot: interaction.user.bot
      },
      channel: interaction.channel
    };

    await interaction.reply('Show info:');
    PaginatedEmbed.run(message);
  }
};

function getData(query) {
  return new Promise(async function (resolve, reject) {
    const url = `http://api.tvmaze.com/search/shows?q=${encodeURI(query)}`;
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
      if (body.status !== 200) {
        reject(
          'There was a problem getting data from the API, make sure you entered a valid TV show name'
        );
      }
      const data = await body.json();
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

function constructInfoObject(show) {
  return {
    name: show.name,
    url: show.url,
    summary: filterSummary(show.summary),
    language: checkIfNull(show.language),
    genres: checkGenres(show.genres),
    type: checkIfNull(show.type),
    premiered: checkIfNull(show.premiered),
    network: checkNetwork(show.network),
    runtime: show.runtime ? show.runtime + ' Minutes' : 'None Listed',
    rating: show.ratings ? show.rating.average : 'None Listed',
    thumbnail: show.image
      ? show.image.original
      : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
  };
}

function filterSummary(summary) {
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

function checkGenres(genres) {
  if (typeof genres === 'object') {
    return genres.join(' ');
  } else if (!genres.length) {
    return 'None Listed';
  }
  return genres;
}

function checkIfNull(value) {
  if (!value) {
    return 'None Listed';
  }
  return value;
}

function checkNetwork(network) {
  if (!network) return 'None Listed';
  return `(**${network.country.code}**) ${network.name}`;
}
