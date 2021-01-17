const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { newsAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

// Skips loading if not found in config.json
if (!newsAPI) return;

module.exports = class GlobalNewsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'world-news',
      aliases: ['global-news', 'reuters'],
      group: 'other',
      memberName: 'world-news',
      description: 'Replies with the 5 latest world news headlines!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    // powered by NewsAPI.org
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?sources=reuters&pageSize=10&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = [];

      for (let i = 1; i <= json.articles.length; ++i) {
        articleArr.push(
          new MessageEmbed()
            .setColor('#FF4F00')
            .setTitle(json.articles[i - 1].title)
            .setURL(json.articles[i - 1].url)
            .setAuthor(json.articles[i - 1].author)
            .setDescription(json.articles[i - 1].description)
            .setThumbnail(json.articles[i - 1].urlToImage)
            .setTimestamp(json.articles[i - 1].publishedAt)
            .setFooter('powered by NewsAPI.org')
        );
      }

      const embed = new Pagination.Embeds()
        .setArray(articleArr)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setPageIndicator(true);

      embed.build();
    } catch (e) {
      message.say(':x: Something failed along the way!');
      return console.error(e);
    }
  }
};
