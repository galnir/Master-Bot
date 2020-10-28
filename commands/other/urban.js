const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');


module.exports = class UrbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'urban',
      group: 'other',
      aliases: ['ud', 'urbandictionary'],
      memberName: 'urban',
      description: 'Get definitions from urban dictonary.',
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: 'text',
          prompt: 'What do you want to search for?',
          type: 'string',
          validate: text => text.length < 50
        }
      ]
    });
  }

  run(message, { text }) {
    fetch(`https://api.urbandictionary.com/v0/define?term=${text}`)
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#BB7D61')
          .setTitle(`${text}`)
	  .setAuthor('Urban Dictionary', 'https://i.imgur.com/vdoosDm.png', 'https://urbandictionary.com')
          .setDescription(`*${json.list[Math.floor(Math.random()*1)].definition}*`)
	  .setURL(json.list[0].permalink)
	  .setTimestamp()
	  .setFooter('Powered by UrbanDictionary', '');
        return message.say(embed);
      })
      .catch(err => {
         message.say('Failed to deliver definition :sob:');
        return console.error(err);
      });
  }
};
