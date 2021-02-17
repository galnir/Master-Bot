const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ChuckNorrisCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'chucknorris',
      aliases: ['chuckfact', 'norris', 'chuck-norris'],
      group: 'other',
      memberName: 'chucknorris',
      description: 'Get a satirical fact about Chuck Norris!',
      throttling: {
        usages: 1,
        duration: 6
      }
    });
  }

  run(message) {
    // thanks to https://api.chucknorris.io
    fetch('https://api.chucknorris.io/jokes/random')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#CD7232')
          .setAuthor(
            'Chuck Norris',
            'https://i.imgur.com/wr1g92v.png',
            'https://chucknorris.io'
          )
          .setDescription(json.value)
          .setTimestamp()
          .setFooter('Powered by chucknorris.io', '');
        message.channel.send(embed);
        return;
      })
      .catch(err => {
        message.reply(':x: An error occured, Chuck is investigating this!');
        return console.error(err);
      });
  }
};
