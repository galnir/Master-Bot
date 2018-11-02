
const snekfetch = require('snekfetch');
const { giphyAPI } = require('../config.json');

module.exports = {
  name: "animegif",
  cooldown: 3,
  description: "query a random anime gif from giphy",
  async execute(message) {
    try {
      const response = await snekfetch.get(
        `https://api.giphy.com/v1/gifs/random?api_key=${giphyAPI}&tag=anime&rating=r`
      );
      message.channel.send(response.body.data.url);
      /*
            const embed = new Discord.RichEmbed()
            .setURL(response.body.data[0].url)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            message.channel.send({embed: embed});
            */
      // embed is commented out because for some reason discord wont display gifs if set as images even tho it worked in the past
    } catch (err) {
      console.error(err);
      message.channel.send("Failed to find a gif :slight_frown:");
    }
  }
};
