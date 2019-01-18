// const fetch = require("node-fetch");
// const { tenorAPI } = require("../config.json");
const fs = require("fs");
module.exports = {
  name: "jojo",
  cooldown: 3,
  description: "query a random jojo gif from tenor",
  execute(message) {
    try {
      const linkArray = fs
        .readFileSync("resources/jojolinks.txt", "utf8")
        .split("\n");
      const link = linkArray[Math.floor(Math.random() * linkArray.length)];
      message.channel.send(link);

      /*
      I changed the command from calling the tenor api each time someone
      uses the !jojo command for 2 main reasons:
      
      1. The tenor api doesn't always respond with a valid jojo gif, sometimes
      it responds with a wrong gif.
      2. Instead of waiting for the api we can just pick a random link from
      the jojolinks file so the response is faster.

      You can still use the old method, it's commented out down below, and
      don't forget to uncomment the require for node-fetch and tenorAPI above
      and make add the 'async' keyword before execute
      */

      /*
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=jojos-bizarre-adventure&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url));
      */

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
