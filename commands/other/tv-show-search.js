const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Pagination = require('discord-paginationembed');
const fetch = require('node-fetch');

module.exports = class TvShowSearchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tv-show-search',
      group: 'other',
      aliases: ['tv-search', 'tvsearch', 'showsearch', 'show-search'],
      memberName: 'tv-show-search',
      description: 'Search for Tv shows with a keyword',
      args: [
        {
          key: 'showQuery',
          prompt: 'What TV show are you looing for?',
          type: 'string'
        }
      ]
    });
  }
  async run(message, { showQuery }) {
    const showResponse = await TvShowSearchCommand.getShowSearch(showQuery);

    try {
      const embedArray = [];
      for (let i = 1; i <= showResponse.length; ++i) {
        // Filter Thumbnail URL
        var showThumbnail = showResponse[i - 1].show.image;
        if (showThumbnail == null)
          showThumbnail =
            'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png';
        else showThumbnail = showResponse[i - 1].show.image.original;

        // Filter Summary Row 1
        var showSummary = showResponse[i - 1].show.summary;
        if (showSummary == null) showSummary = 'None listed';
        else {
          showSummary = showResponse[i - 1].show.summary
            .replace(/<(\/)?b>/g, '**')
            .replace(/<(\/)?i>/g, '*')
            .replace(/<(\/)?p>/g, '')
            .replace(/<br>/g, '\n')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&apos;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .toLocaleString();
        }

        // Filter Language Row 2
        var showLanguage = showResponse[i - 1].show.language;
        if (showLanguage === null) showLanguage = 'None listed';

        // Filter Genere Row 2
        var showGenre = showResponse[i - 1].show.genres;
        if (showGenre.length == 0) showGenre = 'None listed';

        // Filter Types Row 2
        var showType = showResponse[i - 1].show.type;
        if (showType === null) showType = 'None listed';

        // Filter Premiered Row 3
        var showPremiered = showResponse[i - 1].show.premiered;
        if (showPremiered === null) showPremiered = 'None listed';

        // Filter Network Row 3
        var showNetwork = showResponse[i - 1].show.network;
        if (showNetwork === null) showNetwork = 'None listed';
        else
          showNetwork = `(**${
            showResponse[i - 1].show.network.country.code
          }**) ${showResponse[i - 1].show.network.name}`;

        // Filter Runtime Row 3
        var showRuntime = showResponse[i - 1].show.runtime;
        if (showRuntime === null) showRuntime = 'None listed';
        else showRuntime = showResponse[i - 1].show.runtime + ' Minutes';

        // Filter Ratings Row 4
        var showRatings = showResponse[i - 1].show.rating.average;
        if (showRatings === null) showRatings = 'None listed';

        // Build each Tv Shows Embed
        embedArray.push(
          new MessageEmbed()
            .setTitle(showResponse[i - 1].show.name.toLocaleString())
            .setURL(showResponse[i - 1].show.url)
            .setThumbnail(showThumbnail)
            // Row 1
            .setDescription('**Summary**\n' + showSummary)
            // Row 2
            .addField('Language', showLanguage, true)
            .addField('Genre(s)', showGenre, true)
            .addField('Show Type', showType, true)
            // Row 3
            .addField('Premiered', showPremiered, true)
            .addField('Network', showNetwork, true)
            .addField('Runtime', showRuntime, true)
            // Row 4
            .addField('Average Rating', showRatings)
            .setFooter(
              `(Page ${i}/${showResponse.length}) ` + 'Powered by tvmaze.com',
              'https://static.tvmaze.com/images/favico/favicon-32x32.png'
            )
        );
      }

      const showsEmbed = new Pagination.Embeds()
        .setArray(embedArray)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setColor('#17a589');

      // Build Embeds
      showsEmbed.build();
    } catch (error) {
      message.reply(':x: Something went wrong with your request.');
      console.log(error);
    }
  }

  static getShowSearch(showQuery) {
    return new Promise(async function(resolve, reject) {
      const url = `http://api.tvmaze.com/search/shows?q=${showQuery}`;
      try {
        const body = await fetch(url);
        if (body.status == `429`) {
          reject(`:x: Rate Limit exceeded. Please try again in a few minutes.`);
        }
        if (body.status == `503`) {
          reject(
            `:x: Service's are currently unavailable. Please try again later.`
          );
        }
        if (body.status !== 200) {
          reject(
            `There was a problem getting data from the API, make sure you entered a valid Tv show name`
          );
        }
        const data = await body.json();
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          `There was a problem getting data from the API, make sure you entered a valid Tv show name`
        );
      }
    });
  }
};
