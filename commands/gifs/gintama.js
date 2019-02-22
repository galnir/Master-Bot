// const fetch = require("node-fetch");
// const { tenorAPI } = require("../config.json");
const fs = require("fs");
const { Command } = require("discord.js-commando");

module.exports = class GintamaCommand extends Command {
  constructor(client) {
    super(client, {
      name: "gintama",
      group: "gifs",
      memberName: "gintama",
      description: "Replies with a gintama gif!",
      throttling: {
        usages: 2,
        duration: 8
      }
    });
  }

  run(message) {
    try {
      const linkArray = fs
        .readFileSync("resources/gintamalinks.txt", "utf8")
        .split("\n");
      const link = linkArray[Math.floor(Math.random() * linkArray.length)];
      return message.say(link);

      /*
      I changed the command from calling the tenor api each time someone
      uses the !gintama command for 2 main reasons:
      
      1. The tenor api doesn't always respond with a valid gintama gif, sometimes
      it responds with a wrong gif.
      2. Instead of waiting for the api we can just pick a random link from
      the gintamalinks file so the response is faster.
      You can still use the old method, it's commented out down below, and
      don't forget to uncomment the require for node-fetch and tenorAPI above
      and make add the 'async' keyword before execute
      */

      /*
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=gintama&limit=1`
      )
        .then(res => res.json())
        .then(json => message.say(json.results[0].url));
      */
    } catch (e) {
      message.say("Failed to fetch a gintama gif :slight_frown:");
      return console.error(e);
    }
  }
};
