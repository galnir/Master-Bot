const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');

// Skips loading if not found in config.json
if (!tenorAPI) return;

module.exports = class GifCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gif',
      group: 'gifs',
      aliases: ['search-gif', 'search-gifs'],
      memberName: 'gif',
      description: 'Provide a query and replies with a gif!',
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: 'text',
          prompt: ':thinking: What gif would you like to watch?',
          type: 'string',
          validate: text => text.length < 50
        }
      ]
    });
  }

  run(message, { text }) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=${text}&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(e => {
        message.say(':x: Failed to find a gif that matched your query!');
        // console.error(e);
        return;
      });
  }
};
