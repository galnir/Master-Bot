const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trump')
    .setDescription('Get a random quote from Donald Trump!'),
  execute(interaction) {
    fetch('https://api.tronalddump.io/random/quote')
      .then(res => res.json())
      .then(json => {
        const embed = new MessageEmbed()
          .setColor('#BB7D61')
          .setAuthor(
            'Donald Trump',
            'https://www.whitehouse.gov/wp-content/uploads/2021/01/45_donald_trump.jpg'
          )
          .setDescription(json.value)
          .setTimestamp(json.appeared_at)
          .setFooter('Powered by tronalddump.io! Quote was posted', ' ');
        interaction.reply({ embeds: [embed] });
        return;
      })
      .catch(err => {
        interaction.reply('Failed to deliver quote :sob:');
        return console.error(err);
      });
  }
};
