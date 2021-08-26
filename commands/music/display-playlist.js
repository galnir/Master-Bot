const { SlashCommandBuilder } = require('@discordjs/builders');
const Member = require('../../utils/models/Member');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('display-playlist')
    .setDescription('Display a saved playlist')
    .addStringOption(option =>
      option
        .setName('playlistname')
        .setDescription(
          'What is the name of the playlist you would like to display?'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    interaction.deferReply();
    const playlistName = interaction.options.get('playlistname').value;
    // check if user has playlists or if user is saved in the DB
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

    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      let urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        interaction.followUp(`**${playlistName}** is empty!`);
        return;
      }
      const savedPlaylistEmbed = new MessageEmbed()
        .setColor('#ff7373')
        .setTitle(playlistName)
        .setTimestamp();
      urlsArrayClone = urlsArrayClone.slice(0, 24);
      const fields = [];
      for (let i = 0; i < urlsArrayClone.length; i++) {
        fields.push({
          name: `${i + 1}`,
          value: `${urlsArrayClone[i].title}`
        });
      }
      savedPlaylistEmbed.setFields(fields);

      interaction.followUp({ embeds: [savedPlaylistEmbed] });
    } else {
      interaction.followUp(`You have no playlist named ${playlistName}`);
    }
  }
};
