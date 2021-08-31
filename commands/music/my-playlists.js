const { SlashCommandBuilder } = require('@discordjs/builders');
const Member = require('../../utils/models/Member');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('my-playlists')
    .setDescription('Lists your saved playlists'),

  async execute(interaction) {
    interaction.deferReply();

    const userData = await Member.findOne({
      memberId: interaction.member.id
    }).exec();
    if (!userData) {
      interaction.followUp('You have zero saved playlists!');
      return;
    }
    const savedPlaylistsClone = userData.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
      interaction.followUp('You have zero saved playlists!');
      return;
    }
    const fields = [];
    savedPlaylistsClone.forEach((playlist, i) =>
      fields.push({ name: `${i + 1}`, value: playlist.name, inline: true })
    );

    const playlistsEmbed = new MessageEmbed()
      .setTitle('Your saved playlists')
      .setFields(fields)
      .setTimestamp();

    interaction.followUp({ embeds: [playlistsEmbed] });
  }
};
