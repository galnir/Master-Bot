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
      description: 'Replies with a fortune cookie tip',
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
        .setColor('RANDOM')
        .setTitle('Fortune Cookie')
        .setDescription(json.fortune);
      return message.say(embed);
    } catch (e) {
      message.say('Could not obtain fortune cookie :confused: ');
      return console.error(e);
    }
  }
};
