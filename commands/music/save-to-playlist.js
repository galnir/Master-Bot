const { SlashCommandBuilder } = require('@discordjs/builders');
const Member = require('../../utils/models/Member');
const YouTube = require('youtube-sr').default;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('save-to-playlist')
    .setDescription('Save a song or a playlist to a custom playlist')
    .addStringOption(option =>
      option
        .setName('playlistname')
        .setDescription('What is the playlist you would like to save to?')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription(
          'What url would you like to save to playlist? It can also be a playlist url'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const playlistName = interaction.options.get('playlistname').value;
    const url = interaction.options.get('url').value;

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

    if (!validateURL(url)) {
      return interaction.followUp('Please enter a valid YouTube URL!');
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
      const processedURL = await processURL(url, interaction);
      if (!processedURL) return;
      if (Array.isArray(processedURL)) {
        urlsArrayClone = urlsArrayClone.concat(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        interaction.followUp(
          'The playlist you provided was successfully saved!'
        );
      } else {
        urlsArrayClone.push(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        interaction.followUp(
          `I added **${
            savedPlaylistsClone[location].urls[
              savedPlaylistsClone[location].urls.length - 1
            ].title
          }** to **${playlistName}**`
        );
      }
      Member.updateOne(
        { memberId: interaction.member.id },
        { savedPlaylists: savedPlaylistsClone }
      ).exec();
    } else {
      return interaction.followUp(`You have no playlist named ${playlistName}`);
    }
  }
};

function validateURL(url) {
  return (
    url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/) ||
    url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/) ||
    url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)
  );
}

function constructSongObj(video, user) {
  let duration = video.durationFormatted;
  return {
    url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.title,
    rawDuration: video.duration,
    duration,
    thumbnail: video.thumbnail.url,
    memberDisplayName: user.username,
    memberAvatar: user.avatarURL('webp', false, 16)
  };
}

async function processURL(url, interaction) {
  if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    const playlist = await YouTube.getPlaylist(url).catch(function() {
      interaction.followUp(
        ':x: Playlist is either private or it does not exist!'
      );
    });
    if (!playlist) {
      return false;
    }
    let videosArr = await playlist.fetch();
    videosArr = videosArr.videos;
    let urlsArr = [];
    for (let i = 0; i < videosArr.length; i++) {
      if (videosArr[i].private) {
        continue;
      } else {
        try {
          const video = videosArr[i];
          urlsArr.push(constructSongObj(video, interaction.member.user));
        } catch (err) {
          return console.error(err);
        }
      }
    }
    return urlsArr;
  }

  const video = await YouTube.getVideo(url).catch(function() {
    interaction.followUp(
      ':x: There was a problem getting the video you provided!'
    );
    return;
  });
  if (video.live) {
    interaction.followUp("I don't support live streams!");
    return false;
  }
  return constructSongObj(video, interaction.member.user);
}
