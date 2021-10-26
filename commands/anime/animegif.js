const fetch = require('node-fetch');
const { tenorAPI } = require('aws-sdk');
const { Command } = require('discord.js-commando');

module.exports = class AnimegifCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'animegif',
      group: 'gifs',
      aliases: ['anime-gif', 'anime-gifs'],
      memberName: 'animegif',
      description:
        'Losowy gif z anime.',
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  run(message) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(e => {
        message.say('Nie znaleziono gifa.');
        // console.error(e);
        return;
      });
  }
};
