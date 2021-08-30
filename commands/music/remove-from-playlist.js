const { SlashCommandBuilder } = require('@discordjs/builders');
const Member = require('../../utils/models/Member');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-from-playlist')
    .setDescription('Remove a song from a saved playlist')
    .addStringOption(option =>
      option
        .setName('playlist')
        .setDescription(
          'What is the playlist you would like to delete a song from?'
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('index')
        .setDescription(
          'What is the index of the video you would like to delete from your saved playlist?'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const playlistName = interaction.options.get('playlist').value;
    const index = interaction.options.get('index').value;

    const userData = await Member.findOne({
      memberId: interaction.member.id
    }).exec();
    if (!userData) {
      return interaction.followUp('You have no custom playlists!');
    }
    const savedPlaylistsClone = userData.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
      return interaction.followUp('You have no custom playlists!');
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
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        interaction.followUp(`**${playlistName}** is empty!`);
        return;
      }
      if (index > urlsArrayClone.length) {
        interaction.followUp(
          `The index you provided is larger than the playlist's length`
        );
        return;
      }
      const title = urlsArrayClone[index - 1].title;
      urlsArrayClone.splice(index - 1, 1);
      savedPlaylistsClone[location].urls = urlsArrayClone;
      Member.updateOne(
        { memberId: interaction.member.id },
        { savedPlaylists: savedPlaylistsClone }
      ).exec();

      interaction.followUp(
        `I removed **${title}** from **${savedPlaylistsClone[location].name}**`
      );
      return;
    } else {
      return interaction.followUp(`You have no playlist named ${playlistName}`);
    }
  }
};
