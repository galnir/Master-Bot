const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {
  PaginatedFieldMessageEmbed
} = require('@sapphire/discord.js-utilities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the music queue in the form of an embed'),
  async execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const player = client.music.players.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is nothing playing at the moment');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel || voiceChannel.id !== player.channelId) {
      return interaction.reply(
        'You have to be in my channel in order to use that!'
      );
    }

    const queueLength = player.queue.tracks.length;
    if (!queueLength) {
      return interaction.reply('There are no songs in the queue!');
    }

    const queueItems = [];
    for (let i = 0; i < queueLength; i++) {
      queueItems.push({
        title: `${i + 1}`,
        value: player.queue.tracks[i].title
      });
    }
    const baseEmbed = new MessageEmbed()
      .setTitle('Music Queue')
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

    interaction.reply('Queue generated');

    new PaginatedFieldMessageEmbed()
      .setTitleField('Queue item')
      .setTemplate({ baseEmbed })
      .setItems(queueItems)
      .formatItems(item => `${item.title}\n${item.value}`)
      .setItemsPerPage(5)
      .make()
      .run(message);
  }
};
