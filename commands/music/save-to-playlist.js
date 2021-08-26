const { SlashCommandBuilder } = require('@discordjs/builders');
const Member = require('../../utils/models/Member');
const Youtube = require('simple-youtube-api');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

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

function formatDuration(durationObj) {
  const duration = `${durationObj.hours ? durationObj.hours + ':' : ''}${
    durationObj.minutes ? durationObj.minutes : '00'
  }:${
    durationObj.seconds < 10
      ? '0' + durationObj.seconds
      : durationObj.seconds
      ? durationObj.seconds
      : '00'
  }`;
  return duration;
}

function constructSongObj(video, user) {
  let duration = formatDuration(video.duration);
  return {
    url: `https://www.youtube.com/watch?v=${video.raw.id}`,
    title: video.title,
    rawDuration: video.duration,
    duration,
    thumbnail: video.thumbnails.high.url,
    memberDisplayName: user.username,
    memberAvatar: user.avatarURL('webp', false, 16)
  };
}

async function processURL(url, interaction) {
  if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    const playlist = await youtube.getPlaylist(url).catch(function() {
      interaction.followUp(
        ':x: Playlist is either private or it does not exist!'
      );
    });
    if (!playlist) {
      return false;
    }
    const videosArr = await playlist.getVideos().catch(function() {
      interaction.followUp(
        ':x: There was a problem getting one of the videos in the playlist!'
      );
      return;
    });
    let urlsArr = [];
    for (let i = 0; i < videosArr.length; i++) {
      if (videosArr[i].raw.status.privacyStatus == 'private') {
        continue;
      } else {
        try {
          const video = await videosArr[i].fetch();
          urlsArr.push(constructSongObj(video, interaction.member.user));
        } catch (err) {
          return console.error(err);
        }
      }
    }
    return urlsArr;
  }
  url = url
    .replace(/(>|<)/gi, '')
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  const id = url[2].split(/[^0-9a-z_\-]/i)[0];
  const video = await youtube.getVideoByID(id).catch(function() {
    interaction.followUp(
      ':x: There was a problem getting the video you provided!'
    );
    return;
  });
  if (video.raw.snippet.liveBroadcastContent === 'live') {
    interaction.followUp("I don't support live streams!");
    return false;
  }
  return constructSongObj(video, interaction.member.user);
}
