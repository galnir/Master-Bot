// const fetch = require("node-fetch");
// const { tenorAPI } = require("../config.json");
const fs = require('fs');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const config = require(../../config.json');

module.exports = class JojoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'jojo',
      aliases: ['jojo-gif', 'jojo-gifs'],
      group: 'gifs',
      memberName: 'jojo',
      description: 'Replies with a random jojo gif!',
      examples: [
        '`' + config.json + 'jojo',
      ],
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    const embed = new MessageEmbed();
    try {
      const linkArray = fs
        .readFileSync('././resources/gifs/jojolinks.txt', 'utf8')
        .split('\n');
      const link = linkArray[Math.floor(Math.random() * linkArray.length)];
                var embed = new MessageEmbed()
                .setDescription('Click this link if the image doesn\'t load: [Link](' + link + ')')
                .setColor('RANDOM')
                .setImage(link);
      message.channel.send(embed);
      return;

      /*
      I changed the command from calling the tenor api each time someone
      uses the !jojo command for 2 main reasons:
      
      1. The tenor api doesn't always respond with a valid jojo gif, sometimes
      it responds with a wrong gif.
      2. Instead of waiting for the api we can just pick a random link from
      the jojolinks file so the response is faster.
      You can still use the old method, it's commented out down below, and
      don't forget to uncomment the require for node-fetch and tenorAPI above
      */

      /*
      fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=jojos-bizarre-adventure&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url))
        .catch(e => {
          message.reply('Failed to fetch a gif :slight_frown:');
          return console.error(e);
        })
      */
    } catch (e) {
      message.reply(':x: Failed to fetch a gif!');
      return console.error(e);
    }
  }
};
