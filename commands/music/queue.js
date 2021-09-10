const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the music queue'),
  async execute(interaction) {
    await interaction.deferReply();
    const guildData = interaction.client.guildData.get(interaction.guildId);
    if (guildData) {
      if (guildData.triviaData.isTriviaRunning) {
        return interaction.followUp(
          ':x: Try again after the trivia has ended!'
        );
      }
    }
    const player = interaction.client.playerManager.get(interaction.guildId);
    if (player) {
      if (player.queue.length == 0) {
        return interaction.followUp(':x: There are no songs in queue!');
      }
    } else if (!player) {
      return interaction.followUp(':x: There is nothing playing right now!');
    }

    const queueClone = Array.from(player.queue);
    const embeds = [];

    for (let i = 0; i < Math.ceil(queueClone.length / 24); i++) {
      const playlistArray = queueClone.slice(i * 24, 24 + i * 24);
      const fields = [];

      playlistArray.forEach((element, index) => {
        fields.push({
          name: `${index + 1 + i * 24}`,
          value: `${element.title}`
        });
      });

      embeds.push(new MessageEmbed().setTitle(`Page ${i}`).setFields(fields));
    }

    new PagesBuilder(interaction)
      .setTitle('Music Queue')
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
