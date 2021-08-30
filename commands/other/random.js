const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Generate a random number between two provided numbers!')
    .addIntegerOption(option =>
      option
        .setName('min')
        .setDescription('What is the minimum number?')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('max')
        .setDescription('What is the maximum number?')
        .setRequired(true)
    ),

  execute(interaction) {
    const min = Math.ceil(interaction.options.get('min').value);
    const max = Math.floor(interaction.options.get('max').value);
    const rngEmbed = new MessageEmbed().setTitle(
      `${Math.floor(Math.random() * (max - min + 1)) + min}`
    );

    return interaction.reply({ embeds: [rngEmbed] });
  }
};
