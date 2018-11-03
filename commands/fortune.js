const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: "fortune",
  cooldown: 10,
  description: "Returnes random fortune cookie",
  async execute(message, args) {
    const res = await fetch("http://yerkee.com/api/fortune");
    const json = await res.json();
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Fortune Cookie")
      .setDescription(json.fortune);
    message.channel.send(embed);
  }
};
