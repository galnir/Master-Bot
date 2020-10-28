const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class AdviceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'advice',
      group: 'other',
      memberName: 'advice',
      description: 'Get some advice!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    fetch('https://api.adviceslip.com/advice')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#403B3A')
	.setAuthor('Advice Slip', 'https://i.imgur.com/8pIvnmD.png')
          .setDescription(json.slip.advice)
		  .setTimestamp()
		  .setFooter('Powered by adviceslip.com', '');
        return message.say(embed);
      })
      .catch(err => {
        message.say('Failed to deliver advice :sob:');
        return console.error(err);
      });
  }
};
