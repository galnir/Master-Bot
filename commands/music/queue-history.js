const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue-history')
    .setDescription('Display the music queue history'),
  execute(interaction) {
    interaction.deferReply();
    const guildData = interaction.client.guildData.get(interaction.guildId);
    if (guildData) {
      if (guildData.triviaData.isTriviaRunning) {
        return interaction.reply(':x: Try again after the trivia has ended!');
      }
    }
    const player = interaction.client.playerManager.get(interaction.guildId);
    if (player) {
      if (player.queue.length == 0) {
        return interaction.reply(':x: There are no songs in queue!');
      }
    } else if (!player) {
      return interaction.reply(':x: There is nothing playing right now!');
    }

    const queueClone = player.queueHistory.slice(0, 24);
    const queueEmbed = new MessageEmbed()
      .setColor('#CCE763')
      .setTitle('Music Queue History')
      .setTimestamp();
    const fields = [];
    for (let i = 0; i < queueClone.length; i++) {
      fields.push({
        name: `${i + 1}`,
        value: `${queueClone[i].title}`
      });
    }
    queueEmbed.setFields(fields);
    interaction.followUp({ embeds: [queueEmbed] });
  }
};
