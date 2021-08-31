const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insult')
    .setDescription('Generate an evil insult!'),
  execute(interaction) {
    // thanks to https://evilinsult.com :)
    fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#E41032')
          .setAuthor(
            'Evil Insult',
            'https://i.imgur.com/bOVpNAX.png',
            'https://evilinsult.com'
          )
          .setDescription(json.insult)
          .setTimestamp()
          .setFooter('Powered by evilinsult.com', '');
        interaction.reply({ embeds: [embed] });
        return;
      })
      .catch(err => {
        interaction.reply(':x: Failed to deliver insult!');
        return console.error(err);
      });
  }
};
