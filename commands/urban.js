const Discord = require('discord.js');
const snekfetch = require('snekfetch');

module.exports = {
  name: "urban",
  cooldown: 5,
  description: "Searches a word in urban dictionary",
  async execute(message, args) {
    if (!args.length) {
      return message.channel.send("Add a word as an argument to search");
    }
    const { body } = await snekfetch
      .get("https://api.urbandictionary.com/v0/define")
      .query({
        term: args.join(" ")
      });
    if (!body.list.length) {
      return message.channel.send(
        `No results found for **${args.join(" ")}**.`
      );
    }
    const trim = (str, max) =>
      str.length > max ? `${str.slice(0, max - 3)}...` : str;
    const [answer] = body.list;

    const embed = new Discord.RichEmbed()
      .setColor("#EFFF00")
      .setTitle(answer.word)
      .setURL(answer.permalink)
      .addField("Definition", trim(answer.definition, 1024))
      .addField("Example", trim(answer.example, 1024))
      .addField(
        "Rating",
        `${answer.thumbs_up} thumbs up :thumbsup:  ${
          answer.thumbs_down
        } thumbs down :thumbsdown: `
      );

    message.channel.send(embed);
  }
};
