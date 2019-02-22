const fetch = require("node-fetch");
const { tenorAPI } = require("../../config.json");
const { Command } = require("discord.js-commando");

module.exports = class AnimegifCommand extends Command {
  constructor(client) {
    super(client, {
      name: "animegif",
      group: "gifs",
      aliases: ["anime-gif", "anime-gifs"],
      memberName: "animegif",
      description:
        "Provide a name of an anime show or character and I will return a gif!",
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  async run(message) {
    try {
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=1`
      )
        .then(res => res.json())
        .then(json => message.say(json.results[0].url));
    } catch (e) {
      message.say("Failed to find a gif :slight_frown:");
      return console.error(e);
    }
  }
};
