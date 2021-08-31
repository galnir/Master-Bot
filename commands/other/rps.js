const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Rock paper scissors!')
    .addStringOption(option =>
      option
        .setName('move')
        .setDescription(
          'You ready for a game of Rock, Paper, Scissors? \n What is your move?'
        )
        .setRequired(true)
    ),
  execute(interaction) {
    const replies = ['Rock', 'Paper', 'Scissors'];
    const reply = replies[Math.floor(Math.random() * replies.length)];

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Rock, Paper, Scissors')
      .setDescription(`**${reply}**`);
    return interaction.reply({ embeds: [embed] });
  }
};
