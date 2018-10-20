const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const {
    newsAPI
} = require('../config.json');

module.exports = {
    name: 'global-news',
    cooldown: 60,
    description: 'Latest headlines from Reuters, beware that cooldown is higher here',
    async execute(message) {
        try {
            const response = await snekfetch.get(`https://newsapi.org/v2/top-headlines?sources=reuters&apiKey=${newsAPI}`);
            const articleArr = response.body.articles;
            let processArticle = article => {
                const embed = new Discord.RichEmbed()
                    .setColor('#FF4F00')
                    .setTitle(article.title)
                    .setURL(article.url)
                    .setAuthor(article.author)
                    .setDescription(article.description)
                    .setThumbnail(article.urlToImage)
                    .setTimestamp(article.publishedAt)
                    .setFooter('---------------------------------');
				return embed;
            }
            async function processArray(array) {
                for (const article of array) {
					const msg = await processArticle(article)
					message.channel.send(msg);
                }
			}
			await processArray(articleArr)
        } catch (err) {
            console.error(err);
            message.channel.send('Something failed along the way');
        }
    },
};


// The news api is powered by NewsAPI.org!