const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Get the answer to anything!')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('What do you want to ask?')
        .setRequired(true)
    ),
  execute(interaction) {
    // console.log(interaction.options.get('question').value);

    const ballAnswers = fs.readFileSync(
      '././resources/other/8ball.json',
      'utf8'
    );
    const ballArray = JSON.parse(ballAnswers).answers;

    const randomAnswer =
      ballArray[Math.floor(Math.random() * ballArray.length)];

    const answerEmbed = new MessageEmbed()
      .setAuthor('Magic 8 Ball', 'https://i.imgur.com/HbwMhWM.png')
      .setDescription(randomAnswer.text)
      .setColor('#000000')
      .setTimestamp();

    return interaction.reply({ embeds: [answerEmbed] });
  }
};
