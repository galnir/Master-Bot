const fetch = require("node-fetch");
const { tenorAPI } = require("../config.json");

module.exports = {
  name: "gif",
  cooldown: 5,
  description: "query a gif from tenor",
  async execute(message, args) {
    try {
      if (args.length < 1)
        return message.channel.send("Add an argument and try again");
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=${args}&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url));
      /*
            const embed = new Discord.RichEmbed()
            .setURL(response.body.data[0].url)
            .setAuthor(message.author.tag, message.author.displayAvatarURL)
            message.channel.send({embed: embed});
            */
      // embed is commented out because for some reason discord wont display gifs if set as images even tho it worked in the past
    } catch (err) {
      console.error(err);
      message.channel.send("Failed to find a gif that matched your query");
    }
  }
};
