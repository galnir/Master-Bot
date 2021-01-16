const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class DogCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dog',
      aliases: ['dog-pic', 'dogs'],
      group: 'other',
      memberName: 'dog',
      description: 'Replies with a cute dog picture',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  run(message) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=dog&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(err => {
        message.say(':x: Request to find a doggo failed!');
        return console.error(err);
      });
  }
};
