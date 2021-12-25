const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('motivation')
    .setDescription('Get a random motivational quote!'),
  async execute(interaction) {
    // thanks to https://type.fit/api/quotes

    const response = await fetch('https://type.fit/api/quotes');
    const jsonQuotes = await response.json();

    const randomQuote =
      jsonQuotes[Math.floor(Math.random() * jsonQuotes.length)];

    const quoteEmbed = new MessageEmbed()
      .setAuthor(
        'Motivational Quote',
        'https://i.imgur.com/Cnr6cQb.png',
        'https://type.fit'
      )
      .setDescription(`*"${randomQuote.text}*"\n\n-${randomQuote.author}`)
      .setTimestamp()
      .setFooter('Powered by type.fit')
      .setColor('#FFD77A');
    return interaction.reply({ embeds: [quoteEmbed] });
  }
};
