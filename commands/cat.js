const fetch = require("node-fetch");
const { tenorAPI } = require("../config.json");

module.exports = {
  name: "cat",
  cooldown: 5,
  description: "random cat image!",
  async execute(message) {
    try {
      await fetch(
        `https://api.tenor.com/v1/random?key=${tenorAPI}&q=cat&limit=1`
      )
        .then(res => res.json())
        .then(json => message.channel.send(json.results[0].url));
    } catch (err) {
      message.channel.send("Request to find a kitty failed :(");
      console.error(err);
    }
  }
};
