const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {
  PaginatedFieldMessageEmbed
} = require('@sapphire/discord.js-utilities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue-history')
    .setDescription('Display the music queue history in the form of an embed'),
  async execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply(
        'You have to be in my channel in order to use that!'
      );
    }

    const queueHistory = client.queueHistory.get(interaction.guildId);
    if (!queueHistory) {
      return interaction.reply('There are no songs in the queue!');
    }

    const queueItems = [];
    for (let i = 0; i < queueHistory.length; i++) {
      queueItems.push({
        title: `${i + 1}`,
        value: queueHistory[i].title
      });
    }
    const baseEmbed = new MessageEmbed()
      .setTitle('Music History Queue')
      .setColor('#9096e6')
      .setAuthor({
        name: interaction.member.user.username,
        iconURL: interaction.member.user.displayAvatarURL()
      });

    const message = {
      author: {
        id: interaction.member.id,
        bot: interaction.user.bot
      },
      channel: interaction.channel
    };

    interaction.reply('Queue history generated');

    new PaginatedFieldMessageEmbed()
      .setTitleField('Queue History')
      .setTemplate({ baseEmbed })
      .setItems(queueItems)
      .formatItems(item => `${item.title}\n${item.value}`)
      .setItemsPerPage(5)
      .make()
      .run(message);
  }
};
