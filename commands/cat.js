const fetch = require("node-fetch");

module.exports = {
  name: "cat",
  cooldown: 5,
  description: "random cat image!",
  async execute(message) {
    try {
      const { body } = await fetch("https://aws.random.cat/meow");
      message.channel.send(body.file);
    } catch (err) {
      message.channel.send("Request to find a kitty failed :(");
      return Promise.reject(new Error(400));
    }
  }
};
