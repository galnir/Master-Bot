const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class AnimegifCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'animegif',
      group: 'gifs',
      aliases: ['anime-gif', 'anime-gifs'],
      memberName: 'animegif',
      description: 'Provides a random anime gif',
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  run(message) {
    fetch(`https://g.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=50`)
      .then(res => res.json())
      .then(json =>
        message.channel.send(json.results[Math.floor(Math.random() * 49)].url)
      )
      .catch(function onError() {
        message.reply(':x: Failed to find a gif!');
        return;
      });
  }
};
