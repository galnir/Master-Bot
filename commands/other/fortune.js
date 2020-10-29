const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class FortuneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'fortune',
      aliases: ['fortune-cookie'],
      group: 'other',
      memberName: 'fortune',
      description: 'Replies with a fortune cookie tip!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    try {
      const res = await fetch('http://yerkee.com/api/fortune');
      const json = await res.json();
      const embed = new MessageEmbed()
        .setColor('#F4D190')
        .setAuthor('Fortune Cookie', 'https://i.imgur.com/58wIjK0.pngg', 'https://yerkee.com')
        .setDescription(json.fortune)
        .setTimestamp()
        .setFooter('Powered by yerkee.com', '');
      return message.say(embed);
    } catch (e) {
      message.say(':x: Could not obtain a fortune cookie!');
      return console.error(e);
    }
  }
};
