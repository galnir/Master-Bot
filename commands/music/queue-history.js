const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue-history')
    .setDescription('Display the music queue history'),
  execute(interaction) {
    const guildData = interaction.client.guildData.get(interaction.guildId);
    if (!guildData) {
      return interaction.followUp('There is no music queue history!');
    } else if (guildData) {
      if (!guildData.queueHistory.length) {
        return interaction.followUp('There is no music queue history!');
      }
    }

    const queueClone = Array.from(guildData.queueHistory);
    const embeds = [];

    for (let i = 0; i < Math.ceil(queueClone.length / 24); i++) {
      const playlistArray = queueClone.splice(0, 24);
      const fields = [];
      for (let j = 0; j < playlistArray.length; j++) {
        if (playlistArray[j] !== null) {
          fields.push({
            name: `${j + 1}`,
            value: `${playlistArray[j].title}`
          });
        }
      }
      embeds.push(new MessageEmbed().setTitle(`Page ${i}`).setFields(fields));
    }

    new PagesBuilder(interaction)
      .setTitle('Music Queue History')
      .setPages(embeds)
      .setListenTimeout(2 * 60 * 1000)
      .setColor('#9096e6')
      .setAuthor(
        interaction.member.user.username,
        interaction.member.user.displayAvatarURL()
      )
      .build();
  }
};
