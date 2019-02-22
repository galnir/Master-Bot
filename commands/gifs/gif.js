const fetch = require("node-fetch");
const { tenorAPI } = require("../../config.json");
const { Command } = require("discord.js-commando");

module.exports = class GifCommand extends Command {
  constructor(client) {
    super(client, {
      name: "gif",
      group: "gifs",
      aliases: ["search-gif", "search-gifs"],
      memberName: "gif",
      description: "Provide something and I will return a gif!",
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: "text",
          prompt: "What gif would you like to watch?",
          type: "string",
          validate: text => text.length < 50
        }
      ]
    });
  }

  async run(message, { text }) {
    try {
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=${text}&limit=1`
      )
        .then(res => res.json())
        .then(json => message.say(json.results[0].url));
    } catch (e) {
      message.say("Failed to find a gif that matched your query");
      return console.error(e);
    }
  }
};
