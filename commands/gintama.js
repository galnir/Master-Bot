const fetch = require('node-fetch');
const {
  giphyAPI
} = require('../config.json');

module.exports = {
  name: "gintama",
  cooldown: 3,
  description: "query a random gintama gif from giphy",
  async execute(message) {
    try {
      await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${giphyAPI}&tag=gintama&rating=r`).then(res => res.json())
        .then(json => message.channel.send(json.data.url));
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