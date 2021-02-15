const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class KanyeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kanye',
      group: 'other',
      memberName: 'kanye',
      description: 'Get a random Kanye quote.',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    fetch('https://api.kanye.rest/?format=json')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#AF6234')
          .setAuthor('Kanye West', 'https://i.imgur.com/SsNoHVh.png')
          .setDescription(json.quote)
          .setTimestamp()
          .setFooter('Powered by kanye.rest', '');
        message.channel.send(embed);
        return;
      })
      .catch(err => {
        message.reply('Failed to deliver quote :sob:');
        return console.error(err);
      });
  }
};
