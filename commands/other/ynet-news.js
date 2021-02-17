const { MessageEmbed } = require('discord.js');
const { newsAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Pagination = require('discord-paginationembed');

// Skips loading if not found in config.json
if (!newsAPI) return;

module.exports = class YnetNewsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ynet-news',
      aliases: ['israel-news', 'ynet'],
      group: 'other',
      memberName: 'ynet-news',
      description: 'Replies with the 10 latest israeli news headlines',
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
        `https://newsapi.org/v2/top-headlines?sources=ynet&pageSize=10&apiKey=${newsAPI}`
      );
      const json = await response.json();
      const articleArr = [];

      for (let i = 1; i <= json.articles.length; ++i) {
        articleArr.push(
          new MessageEmbed()
            .setColor('#BA160C')
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
    } catch (err) {
      message.reply(':x: Something failed along the way');
      return console.error(err);
    }
  }
};
