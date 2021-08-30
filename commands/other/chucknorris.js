const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chucknorris')
    .setDescription('Get a satirical fact about Chuck Norris!'),
  execute(interaction) {
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
        interaction.reply({ embeds: [embed] });
        return;
      })
      .catch(err => {
        interaction.reply(':x: An error occured, Chuck is investigating this!');
        return console.error(err);
      });
  }
};
