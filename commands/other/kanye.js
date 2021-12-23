const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kanye')
    .setDescription('Get a random Kanye quote.'),
  execute(interaction) {
    fetch('https://api.kanye.rest/?format=json')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#AF6234')
          .setAuthor('Kanye West', 'https://i.imgur.com/SsNoHVh.png')
          .setDescription(json.quote)
          .setTimestamp()
          .setFooter('Powered by kanye.rest', '');
        interaction.reply({ embeds: [embed] });
        return;
      })
      .catch(err => {
        interaction.reply('Failed to deliver quote :sob:');
        return console.error(err);
      });
  }
};
