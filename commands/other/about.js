const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Info about the bot and its creator!'),
  execute(interaction) {
    return interaction.reply(
      'Made by @hyperzone#1185 with :heart: code is available on GitHub https://github.com/galnir/Master-Bot'
    );
  }
};
