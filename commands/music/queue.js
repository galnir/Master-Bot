const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PagesBuilder } = require('discord.js-pages');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the music queue'),
  execute(interaction) {
    //interaction.deferReply({ ephemeral: false });
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

    const queueClone = player.queue;
    const embeds = [];

    for (let i = 0; i < Math.ceil(queueClone.length / 24); i++) {
      const playlistArray = queueClone.splice(0, 24);
      const fields = [];
      for (let j = 0; j < playlistArray.length; j++) {
        fields.push({
          name: `${j + 1}`,
          value: `${playlistArray[j].title}`
        });
      }
      embeds.push(new MessageEmbed().setTitle(`Page ${i}`).setFields(fields));
    }

    new PagesBuilder(interaction)
      .setTitle('Music Queue')
      .setPages(embeds)
      .setColor('#9096e6')
      .setAuthor(
        interaction.member.user.username,
        interaction.member.user.displayAvatarURL()
      )
      .build();
  }
};
