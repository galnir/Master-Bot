const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Resolve an IP address or hostname with additional info.')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription(
          'What do you want to lookup? Please enter a hostname/domain or IP address.'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const resl = interaction.options.get('query').value;

    try {
      var res = await fetch(`http://ip-api.com/json/${resl}`); // fetch json data from ip-api.com

      // json results
      const json = await res.json();
      //embed json results
      const embed = new MessageEmbed()
        .setColor('#42aaf5')
        .setAuthor(
          'IP/Hostname Resolver',
          'https://i.imgur.com/3lIiIv9.png',
          'https://ip-api.com'
        )
        .addFields(
          { name: 'Query', value: resl, inline: true },
          { name: 'Resolves', value: json.query, inline: true },
          { name: '‎', value: '‎', inline: true },
          {
            name: 'Location',
            value: `${json.city}, ${json.zip}, ${json.regionName}, ${json.country}`,
            inline: false
          },
          { name: 'ORG', value: `${json.org}‎`, inline: true }, // organisation who own the ip
          { name: 'ISP', value: json.isp, inline: true }, // internet service provider
          { name: 'OBO', value: json.as, inline: false }
        )
        .setTimestamp(); //img here

      interaction.reply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      interaction.reply(
        'Something went wrong looking for that result, is the api throttled?'
      );
      return;
    }
  }
};
