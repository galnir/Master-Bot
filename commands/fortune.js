const Discord = require("discord.js");
const fetch = require("node-fetch");
// const fs = require("fs");

module.exports = {
  name: "fortune",
  cooldown: 10,
  description: "Returnes random fortune cookie",
  async execute(message) {
    try {
      const res = await fetch("http://yerkee.com/api/fortune");
      const json = await res.json();
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Fortune Cookie")
        .setDescription(json.fortune);
      message.channel.send(embed);
    } catch (e) {
      message.channel.send("Could not obtain fortune cookie :confused: ");
    }

    /*
    The above way is obtaining a fortune cookie through an api,
    the second way is getting an array of quotes from a file(in resources directory)
    and pulling a random quote each time the command is called.
    */

    // try {
    //   const fortuneArray = fs
    //     .readFileSync("resources/fortunecookie.txt", "utf8")
    //     .split("\n");
    //   const fortuneCookie =
    //     fortuneArray[Math.floor(Math.random() * fortuneArray.length)];
    //   const embed = new Discord.MessageEmbed()
    //     .setColor("RANDOM")
    //     .setTitle("Fortune Cookie")
    //     .setDescription(fortuneCookie);
    //   message.channel.send(embed);
    // } catch (e) {
    //   message.channel.send("Could not obtain fortune cookie :confused: ");
    // }
  }
};
