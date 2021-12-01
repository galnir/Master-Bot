const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const Member = require('../../utils/models/Member');
const YouTube = require('youtube-sr').default;
const { getData } = require('spotify-url-info');
const { searchOne } = require('../../utils/music/searchOne');

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
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const playlistName = interaction.options.get('playlistname').value;

    let url = interaction.options.get('url');

    if (!url) {
      const player = await interaction.client.playerManager.get(interaction.guildId);

      if (!player) {
        return interaction.followUp('There is no song playing right now! Provide a valid URL to save');
        // can happen between songs, not a redundant statement
      } else if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        return interaction.followUp('There is no song playing right now! Provide a valid URL to save');
      }
      url = player.nowPlaying.url;
    } else {
      url = url.value;
    }

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
      return interaction.followUp(
        'Please enter a valid YouTube or Spotify URL!'
      );
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
      processURL(url, interaction).then(processedURL => {
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
            `I added **${savedPlaylistsClone[location].urls[
              savedPlaylistsClone[location].urls.length - 1
            ].title
            }** to **${playlistName}**`
          );
        }
        Member.updateOne(
          { memberId: interaction.member.id },
          { savedPlaylists: savedPlaylistsClone }
        ).exec();
      });
    } else {
      return interaction.followUp(`You have no playlist named ${playlistName}`);
    }
  }
};

function validateURL(url) {
  return (
    url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/) ||
    url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/) ||
    url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/) ||
    url.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/)
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
  return new Promise(async function (resolve, reject) {
    if (isSpotifyURL(url)) {
      getData(url)
        .then(async data => {
          if (data.tracks) {
            const spotifyPlaylistItems = data.tracks.items;
            const urlsArr = [];
            for (let i = 0; i < spotifyPlaylistItems.length; i++) {
              try {
                const video = await searchOne(spotifyPlaylistItems[i].track);
                urlsArr.push(constructSongObj(video, interaction.member.user));
              } catch (error) {
                console.error(error);
              }
            }
            resolve(urlsArr);
          } else {
            const video = await searchOne(data);
            resolve(constructSongObj(video, interaction.member.user));
          }
        })
        .catch(err => console.error(err));
    } else if (
      url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)
    ) {
      const playlist = await YouTube.getPlaylist(url).catch(function () {
        reject(':x: Playlist is either private or it does not exist!');
      });
      let videosArr = await playlist.fetch();
      videosArr = videosArr.videos;
      let urlsArr = [];
      for (let i = 0; i < videosArr.length; i++) {
        if (videosArr[i].private) {
          continue;
        } else {
          const video = videosArr[i];
          urlsArr.push(constructSongObj(video, interaction.member.user));
        }
      }
      resolve(urlsArr);
    } else {
      const video = await YouTube.searchOne(url).catch(function () {
        reject(':x: There was a problem getting the video you provided!');
      });
      if (video.live) {
        reject("I don't support live streams!");
      }
      resolve(constructSongObj(video, interaction.member.user));
    }
  });
}

var isSpotifyURL = arg =>
  arg.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/);
