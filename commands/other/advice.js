const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advice')
    .setDescription('Get some advice!'),
  execute(interaction) {
    fetch('https://api.adviceslip.com/advice')
      .then((res) => res.json())
      .then((json) => {
        const embed = new MessageEmbed()
          .setColor('#403B3A')
          .setAuthor(
            'Advice Slip',
            'https://i.imgur.com/8pIvnmD.png',
            'https://adviceslip.com/'
          )
          .setDescription(json.slip.advice)
          .setTimestamp()
          .setFooter('Powered by adviceslip.com', '');
        interaction.reply({ embeds: [embed] });
        return;
      })
      .catch((err) => {
        interaction.reply('Failed to deliver advice :sob:');
        return console.error(err);
      });
  }
};
