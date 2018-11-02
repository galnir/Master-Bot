const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const { newsAPI } = require('../config.json');

module.exports = {
  name: "ynet-news",
  cooldown: 60,
  description:
    "Latest headlines from ynet, beware that cooldown is higher here",
  async execute(message) {
    try {
      let response = await snekfetch.get(
        `https://newsapi.org/v2/top-headlines?sources=ynet&apiKey=${newsAPI}`
      );
      let articleArr = response.body.articles;
      let processArticle = article => {
        let embed = new Discord.RichEmbed()
          .setColor("#BA160C")
          .setTitle(article.title)
          .setURL(article.url)
          .setAuthor(article.author)
          .setDescription(article.description)
          .setThumbnail(article.urlToImage)
          .setTimestamp(article.publishedAt)
          .setFooter("---------------------------------");
        return embed;
      };
      async function processArray(array) {
        for (let article of array) {
          let msg = await processArticle(article);
          message.channel.send(msg);
        }
      }
      await processArray(articleArr);
    } catch (err) {
      console.error(err);
      message.channel.send("Something failed along the way");
    }
  }
};

// The news api is powered by NewsAPI.org! 
