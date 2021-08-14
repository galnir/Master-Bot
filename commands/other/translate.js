const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const ISO6391 = require('iso-639-1');
const translate = require('@vitalets/google-translate-api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate to any language using Google translate.')
    .addStringOption(option =>
      option
        .setName('targetlang')
        .setDescription(
          'What is the target language?(language you want to translate to)'
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('What text do you want to translate?')
        .setRequired(true)
    ),
  execute(interaction) {
    const targetLang = interaction.options.get('targetlang').value;
    const langCode = ISO6391.getCode(targetLang);

    if (langCode === '') {
      return interaction.reply(':x: Please provide a valid language!');
    }

    translate(interaction.options.get('text').value, { to: targetLang })
      .then(response => {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Google Translate: ')
          .setURL('https://translate.google.com/')
          .setDescription(response.text)
          .setFooter('Powered by Google Translate!');
        interaction.reply({ embeds: [embed] });
      })
      .catch(error => {
        interaction.reply(
          ':x: Something went wrong when trying to translate the text'
        );
        console.error(error);
      });
  }
};
