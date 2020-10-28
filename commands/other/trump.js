const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class TrumpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trump',
      group: 'other',
      memberName: 'trump',
      description: 'Get a random quote from Donald Trump!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    fetch('https://api.tronalddump.io/random/quote')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#BB7D61')
	  .setAuthor('Donald Trump', 'https://www.whitehouse.gov/wp-content/uploads/2017/11/President-Trump-Official-Portrait-200x200.jpg')
          .setDescription(json.value)
		  .setTimestamp()
		  .setFooter('Powered by tronalddump.io', '');
        return message.say(embed);
      })
      .catch(err => {
        message.say('Failed to deliver quote :sob:');
        return console.error(err);
      });
  }
};
