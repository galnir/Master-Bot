const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow
} = require('discord.js');
const Player = require('../../utils/music/Player');
const Youtube = require('simple-youtube-api');
const ytsr = require('ytsr');
const { getData } = require('spotify-url-info');
const { youtubeAPI } = require('../../config.json');
let {
  playLiveStreams,
  playVideosLongerThan1Hour,
  maxQueueLength,
  AutomaticallyShuffleYouTubePlaylists,
  LeaveTimeOut,
  MaxResponseTime,
  deleteOldPlayMessage
} = require('../../options.json');
const Member = require('../../utils/models/Member');
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  AudioPlayerStatus
} = require('@discordjs/voice');

const youtube = new Youtube(youtubeAPI);
// Check If Options are Valid
if (typeof playLiveStreams !== 'boolean') playLiveStreams = true;
if (typeof maxQueueLength !== 'number' || maxQueueLength < 1) {
  maxQueueLength = 1000;
}
if (typeof LeaveTimeOut !== 'number') {
  LeaveTimeOut = 90;
}
if (typeof MaxResponseTime !== 'number') {
  MaxResponseTime = 30;
}
if (typeof AutomaticallyShuffleYouTubePlaylists !== 'boolean') {
  AutomaticallyShuffleYouTubePlaylists = false;
}
if (typeof playVideosLongerThan1Hour !== 'boolean') {
  playVideosLongerThan1Hour = true;
}
if (typeof deleteOldPlayMessage !== 'boolean') {
  deleteOldPlayMessage = false;
}

// If the Options are outside of min or max then use the closest number
LeaveTimeOut = LeaveTimeOut > 600 ? 600 : LeaveTimeOut &&
  LeaveTimeOut < 2 ? 1 : LeaveTimeOut; // prettier-ignore

MaxResponseTime = MaxResponseTime > 150 ? 150 : MaxResponseTime &&
  MaxResponseTime < 5 ? 5 : MaxResponseTime; // prettier-ignore

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play any song or playlist from YouTube or Spotify!')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription(
          ':notes: What song or playlist would you like to listen to? Add -s to shuffle a playlist'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = await interaction.deferReply({
      fetchReply: true
    });
    // Make sure that only users present in a voice channel can use 'play'
    if (!interaction.member.voice.channel) {
      interaction.reply(
        ':no_entry: Please join a voice channel and try again!'
      );
      return;
    }
    // Make sure there isn't a 'music-trivia' running
    if (
      interaction.client.guildData.get(interaction.guild.id).triviaData
        .isTriviaRunning
    ) {
      interaction.reply(':x: Please try after the trivia has ended!');
      return;
    }
    let query = interaction.options.get('query').value;
    //Parse query to check for flags

    var splitQuery = query.split(' ');
    var shuffleFlag = splitQuery[splitQuery.length - 1] === '-s';
    var reverseFlag = splitQuery[splitQuery.length - 1] === '-r';
    var nextFlag = splitQuery[splitQuery.length - 1] === '-n';
    var jumpFlag = splitQuery[splitQuery.length - 1] === '-j';

    if (shuffleFlag || reverseFlag || nextFlag || jumpFlag) splitQuery.pop();
    query = splitQuery.join(' ');

    let player = interaction.client.playerManager.get(interaction.guildId);

    if (!player) {
      player = new Player();
      interaction.client.playerManager.set(interaction.guildId, player);
    }

    // Check if the query is actually a saved playlist name

    const userData = await Member.findOne({
      memberId: interaction.member.id
    }).exec(); // Object

    if (userData !== null) {
      const playlistsArray = userData.savedPlaylists;
      const found = playlistsArray.find(playlist => playlist.name === query);
      // Found a playlist with a name matching the query and it's not empty
      if (found && playlistsArray[playlistsArray.indexOf(found)].urls.length) {
        const fields = [
          {
            label: 'Playlist',
            description: 'Select playlist',
            value: 'playlist_option',
            emoji: '⏩'
          },
          {
            label: 'Shuffle Playlist',
            description: 'Select playlist and shuffle',
            value: 'shuffle_option',
            emoji: '🔀'
          },
          {
            label: 'YouTube',
            description: 'Search on YouTube',
            value: 'youtube_option',
            emoji: '🔍'
          },
          {
            label: 'Cancel',
            value: 'cancel_option',
            emoji: '❌'
          }
        ];
        let hasHistoryField = false;
        const index = String(Number(query) - 1);
        if (
          Number(query) &&
          typeof player.queueHistory[index] !== 'undefined'
        ) {
          hasHistoryField = true;
          fields.unshift({
            name: `play ${player.queueHistory[index].title}`,
            description: 'Play last song',
            value: 'previous_song_option',
            emoji: '🔙'
          });
        }
        const row = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('1')
            .setPlaceholder('Please select an option')
            .addOptions(fields)
        );
        const clarificationOptions = await message.channel.send({
          content: 'Clarify Please',
          components: [row]
        });
        //await message.delete();
        const clarificationCollector = clarificationOptions.createMessageComponentCollector(
          {
            componentType: 'SELECT_MENU',
            time: MaxResponseTime * 1000
          }
        );

        clarificationCollector.on('end', collected => {
          if (clarificationOptions)
            clarificationOptions.delete().catch(console.error);
        });

        clarificationCollector.on('collect', async i => {
          if (i.user.id !== interaction.user.id) {
            i.reply({
              content: `This element is not for you!`,
              ephemeral: true
            });
          } else {
            clarificationCollector.stop();
            const value = i.values[0];

            switch (value) {
              case 'previous_song_option':
                if (!hasHistoryField) break;
                if (
                  player.audioPlayer.state.status !== AudioPlayerStatus.Playing
                ) {
                  player.queue.unshift(player.queueHistory[index]);
                  handleSubscription(player.queue, interaction, player);
                  break;
                }
                if (nextFlag || jumpFlag) {
                  player.queue.unshift(player.queueHistory[index]);
                  if (
                    jumpFlag &&
                    player.audioPlayer.state.status == AudioPlayerStatus.Playing
                  ) {
                    player.loopSong = false;
                    player.audioPlayer.stop();
                  }
                } else {
                  player.queue.push(player.queueHistory[index]);
                }
                interaction.reply(
                  `'${player.queueHistory[index].title}' was added to queue!`
                );
                break;
              // 1: Play the saved playlist
              case 'playlist_option':
                playlistsArray[playlistsArray.indexOf(found)].urls.map(song =>
                  player.queue.push(song)
                );

                if (
                  player.audioPlayer.state.status === AudioPlayerStatus.Playing
                ) {
                  // Send a message indicating that the playlist was added to the queue
                  // interactiveEmbed(interaction)
                  //   .addField(
                  //     'Added Playlist',
                  //     `:new: **${query}** added ${
                  //       playlistsArray[playlistsArray.indexOf(found)].urls
                  //         .length
                  //     } songs to the queue!`
                  //   )
                  //   .build();
                } else {
                  await interaction.followUp('Added playlist to queue');
                  handleSubscription(player.queue, interaction, player);
                }
                break;
              // 2: Play the shuffled saved playlist
              case 'shuffle_option':
                shuffleArray(
                  playlistsArray[playlistsArray.indexOf(found)].urls
                ).map(song => player.queue.push(song));

                if (
                  player.audioPlyaer.state.status === AudioPlayerStatus.Playing
                ) {
                  // Send a message indicating that the playlist was added to the queue
                  // interactiveEmbed(interaction)
                  //   .addField(
                  //     'Added Playlist',
                  //     `:new: **${query}** added ${
                  //       playlistsArray[playlistsArray.indexOf(found)].urls
                  //         .length
                  //     } songs to the queue!`
                  //   )
                  //   .build();
                } else {
                  handleSubscription(player.queue, interaction, player);
                }
                break;
              // 3: Search for the query on YouTube
              case 'youtube_option':
                // await searchYoutube(
                //   query,
                //   interaction,
                //   interaction.member.voice.channel
                // );
                break;
              // 4: Cancel
              case 'cancel_option':
                break;
            }
          }
        });
      }
      return;
    }

    // check if the user wants to play a song from the history queue
    if (Number(query)) {
      const index = String(Number(query) - 1);
      // continue if there's no index matching the query on the history queue
      if (typeof player.queueHistory[index] === 'undefined') {
        return;
      }
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('history-select')
          .setPlaceholder('Please select an option')
          .addOptions([
            {
              label: 'History Queue',
              description: `Play song number ${query}`,
              value: 'history_option',
              emoji: '🔙'
            },
            {
              label: 'YouTube',
              description: `Search '${query}' on YouTube`,
              value: 'youtube_option',
              emoji: '🔍'
            },
            {
              label: 'Cancel',
              value: 'cancel_option',
              emoji: '❌'
            }
          ])
      );
      const clarificationOptions = await message.channel.send({
        content: 'Did you mean to play a song from the history queue?',
        components: [row]
      });
      const clarificationCollector = clarificationOptions.createMessageComponentCollector(
        {
          componentType: 'SELECT_MENU',
          time: MaxResponseTime * 1000
        }
      );

      clarificationCollector.on('end', collected => {});

      clarificationCollector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          i.reply({
            content: `This element is not for you!`,
            ephemeral: true
          });
        } else {
          clarificationCollector.stop();
          const value = i.values[0];

          switch (value) {
            // 1: Play a song from the history queue
            case 'history_option':
              if (
                player.audioPlayer.state.status !== AudioPlayerStatus.Playing
              ) {
                player.queue.unshift(player.queueHistory[index]);
                handleSubscription(player.queue, interaction, player);
                break;
              }
              if (nextFlag || jumpFlag) {
                player.queue.unshift(player.queueHistory[index]);
                if (
                  jumpFlag &&
                  player.audioPlayer.state.status === AudioPlayerStatus.Playing
                ) {
                  player.loopSong = false;
                  player.audioPlayer.stop();
                }
              } else {
                player.queue.push(player.queueHistory[index]);
              }
              interaction.reply(
                `'${player.queueHistory[index].title}' was added to queue!`
              );
              break;
            // 2: Search for the query on YouTube
            case 'youtube_option':
              // await searchYoutube(
              //   query,
              //   interaction,
              //   interaction.member.voice.channel
              // );
              break;
            // 3: Cancel
            case 'cancel_option':
              break;
          }
        }
      });
      return;
    }
    if (isSpotifyURL(query)) {
      getData(query)
        .then(async data => {
          // 'tracks' property only exists on a playlist data object
          if (data.tracks) {
            // handle playlist
            const spotifyPlaylistItems = data.tracks.items;
            const processingMessage = await interaction.channel.send({
              content: 'Processing Playlist...'
            });
            for (let i = 0; i < spotifyPlaylistItems.length; i++) {
              const artistsAndName = concatSongNameAndArtists(
                spotifyPlaylistItems[i].track
              );
              const ytResult = await ytsr(artistsAndName, { limit: 1 });
              const video = {
                title: ytResult.items[0].title,
                url: ytResult.items[0].url,
                thumbnails: {
                  high: {
                    url: `https://i.ytimg.com/vi/${ytResult.items[0].id}/hqdefault.jpg`
                  }
                },
                // the true value is used to differentiate this duration from the rawDuration recieved from the YT API
                duration: [ytResult.items[0].duration, true]
              };
              if (nextFlag || jumpFlag) {
                flagLogic(interaction, video, jumpFlag);
              } else {
                player.queue.push(
                  constructSongObj(
                    video,
                    interaction.member.voice.channel,
                    interaction.member.user
                  )
                );
              }
            }
            processingMessage.edit('Playlist Processed!');
            if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
              handleSubscription(player.queue, interaction, player);
              return;
            }
            return;
          }
          // single track
          else {
            const artistsAndName = concatSongNameAndArtists(data);
            // Search on YT
            const ytResult = await ytsr(artistsAndName, { limit: 1 });
            const video = {
              title: ytResult.items[0].title,
              url: ytResult.items[0].url,
              thumbnails: {
                high: {
                  url: `https://i.ytimg.com/vi/${ytResult.items[0].id}/hqdefault.jpg`
                }
              },
              // the true value is used to differentiate this duration from the rawDuration recieved from the YT API
              duration: [ytResult.items[0].duration, true]
            };
            if (nextFlag || jumpFlag) {
              flagLogic(interaction, video, jumpFlag);
            } else {
              player.queue.push(
                constructSongObj(
                  video,
                  interaction.member.voice.channel,
                  interaction.member.user
                )
              );
            }
            if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
              handleSubscription(player.queue, interaction, player);
              return;
            }
          }
        })
        .catch(error => {
          console.error(error);
          interaction.reply(`I couldn't find what you were looking for :(`);
        });
      return;
    }

    if (isYouTubePlaylistURL(query)) {
      const playlist = await youtube.getPlaylist(query);
      if (!playlist)
        return interaction.reply(
          ':x: Playlist is either private or it does not exist!'
        );

      let videosArr = await playlist.getVideos();
      if (!videosArr)
        return interaction.reply(
          ":x: I hit a problem when trying to fetch the playlist's videos"
        );

      if (AutomaticallyShuffleYouTubePlaylists || shuffleFlag) {
        videosArr = shuffleArray(videosArr);
      }

      if (reverseFlag) {
        videosArr = videosArr.reverse();
      }

      if (player.queue.length >= maxQueueLength)
        return interaction.reply(
          'The queue is full, please try adding more songs later'
        );
      videosArr = videosArr.splice(0, maxQueueLength - player.queue.length);

      //variable to know how many songs were skipped because of privacyStatus
      var skipAmount = 0;

      await videosArr.reduce(async (memo, video, key) => {
        await memo;
        // don't process private videos
        if (
          video.raw.status.privacyStatus == 'private' ||
          video.raw.status.privacyStatus == 'privacyStatusUnspecified'
        ) {
          skipAmount++;
          return;
        }

        try {
          const fetchedVideo = await video.fetch();
          if (nextFlag || jumpFlag) {
            player.queue.splice(
              key - skipAmount,
              0,
              constructSongObj(
                fetchedVideo,
                interaction.member.voice.channel,
                interaction.member.user
              )
            );
          } else {
            player.queue.push(
              constructSongObj(
                fetchedVideo,
                interaction.member.voice.channel,
                interaction.member.user
              )
            );
          }
        } catch (err) {
          return console.error(err);
        }
      }, undefined);
      if (
        jumpFlag &&
        player.audioPlayer.state.status === AudioPlayerStatus.Playing
      ) {
        player.loopSong = false;
        player.audioPlayer.stop();
      }
      if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        handleSubscription(player.queue, interaction, player);
        return;
      } else {
        // interactiveEmbed(interaction)
        //   .addField('Added Playlist', `[${playlist.title}](${playlist.url})`)
        //   .build();
        return;
      }
    }

    if (isYouTubeVideoURL(query)) {
      const id = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2]
        .split(/[^0-9a-z_\-]/i)[0];

      const timestampRegex = /t=([^#&\n\r]+)/g;
      let timestamp = timestampRegex.exec(query);
      if (!timestamp) {
        timestamp = 0;
      } else {
        timestamp = timestamp[1];
        if (timestamp.endsWith('s')) {
          timestamp = timestamp.substring(0, timestamp.indexOf('s'));
        }
        if (!Number(timestamp)) timestamp = 0;
      }
      timestamp = Number(timestamp);

      const video = await youtube.getVideoByID(id).catch(function() {
        interaction.reply(
          ':x: There was a problem getting the video you provided!'
        );
      });
      if (!video) return;

      if (
        video.raw.snippet.liveBroadcastContent === 'live' &&
        !playLiveStreams
      ) {
        interaction.reply(
          'Live streams are disabled in this server! Contact the owner'
        );
        return;
      }

      if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
        interaction.reply(
          'Videos longer than 1 hour are disabled in this server! Contact the owner'
        );
        return;
      }

      if (player.length > maxQueueLength) {
        interaction.reply(
          `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to play more songs`
        );
        return;
      }
      if (nextFlag || jumpFlag) {
        flagLogic(interaction, video, jumpFlag);
      } else {
        player.queue.push(
          constructSongObj(
            video,
            interaction.member.voice.channel,
            interaction.member.user,
            timestamp
          )
        );
      }

      if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
        handleSubscription(player.queue, interaction, player);
        return;
      }

      // interactiveEmbed(interaction)
      //   .addField('Added to Queue', `:new: [${video.title}](${video.url})`)
      //   .build();
      return;
    }

    // If user provided a song/video name
    // await searchYoutube(
    //   query,
    //   interaction,
    //   interaction.member.voice.channel,
    //   nextFlag,
    //   jumpFlag
    // );
  }
};

var handleSubscription = async (queue, interaction, player) => {
  let voiceChannel = queue[0].voiceChannel;
  if (!voiceChannel) {
    // happens when loading a saved playlist
    voiceChannel = interaction.member.voice.channel;
  }
  // if (interaction.guild.me.voice.channel !== null) {
  //   if (interaction.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
  //     queue[0].voiceChannel = interaction.guild.me.voice.channel;
  //   }
  // }
  const title = player.queue[0].title;
  let connection = player.connection;
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });
    connection.on('error', console.error);
  }

  player.passConnection(connection);

  try {
    await entersState(player.connection, VoiceConnectionStatus.Ready, 10000);
  } catch (err) {
    console.error(err);
    await interaction.followUp({ content: 'Failed to join your channel!' });
    return;
  }
  player.process(player.queue);
  await interaction.followUp(`Enqueued ${title}`);
};

var playbackBar = data => {
  if (data.nowPlaying.duration === 'Live Stream') return '';
  const formatTime = compose(timeString, millisecondsToTimeObj);

  const passedTimeInMS = data.songDispatcher.streamTime;
  const songLengthFormatted = timeString(data.nowPlaying.rawDuration);
  const songLengthInMS = rawDurationToMilliseconds(data.nowPlaying.rawDuration);

  const playback = Array(11).fill('▬');
  playback[Math.floor((passedTimeInMS / songLengthInMS) * 11)] =
    ':musical_note:';

  return `${formatTime(passedTimeInMS)} ${playback.join(
    ''
  )} ${songLengthFormatted}`;
};

// side effects function
var flagLogic = (message, video, jumpFlag) => {
  message.guild.musicData.queue.splice(
    0,
    0,
    constructSongObj(video, message.member.voice.channel, message.member.user)
  );
  if (jumpFlag && message.guild.musicData.songDispatcher) {
    message.guild.musicData.loopSong = false;
    message.guild.musicData.songDispatcher.end();
  }
};

/********************************** Helper Functions *****************************/

var compose = (f, g) => x => f(g(x));

var isYouTubeVideoURL = arg =>
  arg.match(
    /^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/
  );

var isYouTubePlaylistURL = arg =>
  arg.match(
    /^https?:\/\/(music.)?(www.youtube.com|youtube.com)\/playlist(.*)$/
  );

var isSpotifyURL = arg =>
  arg.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/);

var shuffleArray = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// timeString = timeObj => 'HH:MM:SS' // if HH is missing > MM:SS
var timeString = timeObj => {
  if (timeObj[1] === true) return timeObj[0];
  return `${timeObj.hours ? timeObj.hours + ':' : ''}${
    timeObj.minutes ? timeObj.minutes : '00'
  }:${
    timeObj.seconds < 10
      ? '0' + timeObj.seconds
      : timeObj.seconds
      ? timeObj.seconds
      : '00'
  }`;
};

var millisecondsToTimeObj = ms => ({
  seconds: Math.floor((ms / 1000) % 60),
  minutes: Math.floor((ms / (1000 * 60)) % 60),
  hours: Math.floor((ms / (1000 * 60 * 60)) % 24)
});

var rawDurationToMilliseconds = obj =>
  obj.hours * 3600000 + obj.minutes * 60000 + obj.seconds * 1000;

var concatSongNameAndArtists = data => {
  // Spotify only
  let artists = '';
  data.artists.forEach(artist => (artists = artists.concat(' ', artist.name)));
  const songName = data.name;
  return `${songName} ${artists}`;
};

var constructSongObj = (video, voiceChannel, user, timestamp) => {
  let duration = timeString(video.duration);
  if (duration === '00:00') duration = 'Live Stream';
  // checks if the user searched for a song using a Spotify URL
  let url =
    video.duration[1] == true
      ? video.url
      : `https://www.youtube.com/watch?v=${video.raw.id}`;
  return {
    url,
    title: video.title,
    rawDuration: video.duration,
    duration,
    timestamp,
    thumbnail: video.thumbnails.high.url,
    voiceChannel,
    memberDisplayName: user.username,
    memberAvatar: user.avatarURL('webp', false, 16)
  };
};
