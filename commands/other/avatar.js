const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription(`Responds with a user's avatar`)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user which avatar you want to display')
        .setRequired(true)
    ),

  execute(interaction) {
    const user = interaction.options.get('user').user;
    const embed = new MessageEmbed()
      .setTitle(user.username)
      .setImage(user.displayAvatarURL({ dynamic: true }))
      .setColor('0x00ae86');

    return interaction.reply({ embeds: [embed] });
  }
};
