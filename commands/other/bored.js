const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class BoredCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bored',
      group: 'other',
      memberName: 'bored',
      description: 'Generate a random activity!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    fetch('https://www.boredapi.com/api/activity?participants=1')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#6BA3FF')
          .setTitle('Bored Activity')
          .setDescription(json.activity)
		  .setTimestamp()
		  .setFooter('Powered by boredapi.com', 'https://i.imgur.com/7Y2F38n.png');
        return message.say(embed);
      })
      .catch(err => {
        message.say('Failed to deliver activity :sob:');
        return console.error(err);
      });
  }
};
