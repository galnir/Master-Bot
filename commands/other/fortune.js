const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Replies with a fortune cookie tip!'),
  async execute(interaction) {
    try {
      const res = await fetch('http://yerkee.com/api/fortune');
      const json = await res.json();
      const embed = new MessageEmbed()
        .setColor('#F4D190')
        .setAuthor(
          'Fortune Cookie',
          'https://i.imgur.com/58wIjK0.png',
          'https://yerkee.com'
        )
        .setDescription(json.fortune)
        .setTimestamp()
        .setFooter('Powered by yerkee.com', '');
      interaction.reply({ embeds: [embed] });
      return;
    } catch (e) {
      interaction.reply(':x: Could not obtain a fortune cookie!');
      return console.error(e);
    }
  }
};
