const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageSelectMenu, MessageActionRow } = require('discord.js');
const Player = require('../../utils/music/Player');
const { getData } = require('spotify-url-info');
const YouTube = require('youtube-sr').default;
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
const createGuildData = require('../../utils/createGuildData');
const { searchOne } = require('../../utils/music/searchOne');

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
    if (!interaction.client.guildData.get(interaction.guildId)) {
      interaction.client.guildData.set(interaction.guildId, createGuildData());
    }
    const message = await interaction.deferReply({
      fetchReply: true
    });
    // Make sure that only users present in a voice channel can use 'play'
    if (!interaction.member.voice.channel) {
      interaction.followUp(
        ':no_entry: Please join a voice channel and try again!'
      );
      return;
    }
    // Make sure there isn't a 'music-trivia' running
    if (
      interaction.client.guildData.get(interaction.guild.id).triviaData
        .isTriviaRunning
    ) {
      interaction.followUp(':x: Please try after the trivia has ended!');
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

    if (player.commandLock) {
      return interaction.followUp(
        'Please wait until the last play call is processed'
      );
    }

    player.commandLock = true;

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

        const clarificationCollector = clarificationOptions.createMessageComponentCollector(
          {
            componentType: 'SELECT_MENU',
            time: MaxResponseTime * 1000
          }
        );

        clarificationCollector.on('end', () => {
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
                player.commandLock = false;
                interaction.followUp(
                  `'${player.queueHistory[index].title}' was added to queue!`
                );
                break;
              // 1: Play the saved playlist
              case 'playlist_option':
                playlistsArray[playlistsArray.indexOf(found)].urls.map(song =>
                  player.queue.push(song)
                );
                player.commandLock = false;
                await interaction.followUp('Added playlist to queue');
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
                  handleSubscription(player.queue, interaction, player);
                }
                break;
              // 2: Play the shuffled saved playlist
              case 'shuffle_option':
                shuffleArray(
                  playlistsArray[playlistsArray.indexOf(found)].urls
                ).map(song => player.queue.push(song));

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
                  handleSubscription(player.queue, interaction, player);
                }
                break;
              // 3: Search for the query on YouTube
              case 'youtube_option':
                await searchYoutube(
                  query,
                  interaction,
                  player,
                  interaction.member.voice.channel
                );
                break;
              // 4: Cancel
              case 'cancel_option':
                player.commandLock = false;
                interaction.followUp('Canceled search');
                deletePlayerIfNeeded(interaction);
                break;
            }
          }
        });
        return;
      }
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
              player.commandLock = false;
              interaction.followUp(
                `'${player.queueHistory[index].title}' was added to queue!`
              );
              break;
            // 2: Search for the query on YouTube
            case 'youtube_option':
              await searchYoutube(
                query,
                interaction,
                player,
                interaction.member.voice.channel
              );
              break;
            // 3: Cancel
            case 'cancel_option':
              deletePlayerIfNeeded(interaction);
              interaction.followUp('Canceled search');
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
              try {
                const video = await searchOne(spotifyPlaylistItems[i].track);

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
              } catch (error) {
                return interaction.followup(error);
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
            try {
              const video = await searchOne(data);
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
                return interaction.followUp(
                  `Added **${video.title}** to queue`
                );
              }
              if (
                player.audioPlayer.state.status !== AudioPlayerStatus.Playing
              ) {
                handleSubscription(player.queue, interaction, player);
                return;
              }
            } catch (error) {
              return interaction.followUp(error);
            }
          }
        })
        .catch(error => {
          deletePlayerIfNeeded(interaction);
          console.error(error);
          interaction.followUp(`I couldn't find what you were looking for :(`);
        });
      return;
    }

    if (isYouTubePlaylistURL(query)) {
      const playlist = await YouTube.getPlaylist(query);
      if (!playlist) {
        deletePlayerIfNeeded(interaction);
        return interaction.followUp(
          ':x: Playlist is either private or it does not exist!'
        );
      }

      let videosArr = await playlist.fetch();
      if (!videosArr) {
        player.commandLock = false;
        deletePlayerIfNeeded(interaction);
        return interaction.followUp(
          ":x: I hit a problem when trying to fetch the playlist's videos"
        );
      }
      videosArr = videosArr.videos;

      if (AutomaticallyShuffleYouTubePlaylists || shuffleFlag) {
        videosArr = shuffleArray(videosArr);
      }

      if (reverseFlag) {
        videosArr = videosArr.reverse();
      }

      if (player.queue.length >= maxQueueLength) {
        player.commandLock = false;
        return interaction.followUp(
          'The queue is full, please try adding more songs later'
        );
      }
      videosArr = videosArr.splice(0, maxQueueLength - player.queue.length);

      //variable to know how many songs were skipped because of privacyStatus
      var skipAmount = 0;

      await videosArr.reduce(async (__, video, key) => {
        // don't process private videos
        if (video.private) {
          skipAmount++;
          return;
        }
        if (nextFlag || jumpFlag) {
          player.queue.splice(
            key - skipAmount,
            0,
            constructSongObj(
              video,
              interaction.member.voice.channel,
              interaction.member.user
            )
          );
        } else {
          player.queue.push(
            constructSongObj(
              video,
              interaction.member.voice.channel,
              interaction.member.user
            )
          );
        }
      });
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
        player.commandLock = false;
        return interaction.followUp('Added playlist to queue!');
      }
    }

    if (isYouTubeVideoURL(query)) {
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

      const video = await YouTube.getVideo(query).catch(function() {
        deletePlayerIfNeeded(interaction);
        interaction.followUp(
          ':x: There was a problem getting the video you provided!'
        );
      });
      if (!video) return;
      if (video.live === 'live' && !playLiveStreams) {
        player.commandLock = false;
        deletePlayerIfNeeded(interaction);
        interaction.followUp(
          'Live streams are disabled in this server! Contact the owner'
        );
        return;
      }

      if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
        player.commandLock = false;
        deletePlayerIfNeeded(interaction);
        interaction.followUp(
          'Videos longer than 1 hour are disabled in this server! Contact the owner'
        );
        return;
      }

      if (player.length > maxQueueLength) {
        player.commandLock = false;
        interaction.followUp(
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
    await searchYoutube(
      query,
      interaction,
      player,
      interaction.member.voice.channel,
      nextFlag,
      jumpFlag
    );
  }
};

var handleSubscription = async (queue, interaction, player) => {
  let voiceChannel = queue[0].voiceChannel;
  if (!voiceChannel) {
    // happens when loading a saved playlist
    voiceChannel = interaction.member.voice.channel;
  }

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
  player.textChannel = interaction.channel;
  player.passConnection(connection);

  try {
    await entersState(player.connection, VoiceConnectionStatus.Ready, 10000);
  } catch (err) {
    player.commandLock = false;
    deletePlayerIfNeeded(interaction);
    console.error(err);
    await interaction.followUp({ content: 'Failed to join your channel!' });
    return;
  }
  player.process(player.queue);
  await interaction.followUp(`Enqueued ${title}`);
};

// var playbackBar = data => {
//   if (data.nowPlaying.duration === 'Live Stream') return '';
//   const formatTime = compose(timeString, millisecondsToTimeObj);

//   const passedTimeInMS = data.songDispatcher.streamTime;
//   const songLengthFormatted = timeString(data.nowPlaying.rawDuration);
//   const songLengthInMS = rawDurationToMilliseconds(data.nowPlaying.rawDuration);

//   const playback = Array(11).fill('▬');
//   playback[Math.floor((passedTimeInMS / songLengthInMS) * 11)] =
//     ':musical_note:';

//   return `${formatTime(passedTimeInMS)} ${playback.join(
//     ''
//   )} ${songLengthFormatted}`;
// };

var searchYoutube = async (
  query,
  interaction,
  player,
  voiceChannel,
  nextFlag,
  jumpFlag
) => {
  const videos = await YouTube.search(query, { limit: 5 }).catch(
    async function() {
      return interaction.followUp(
        ':x: There was a problem searching the video you requested!'
      );
    }
  );
  if (!videos) {
    player.commandLock = false;
    return interaction.followUp(
      `:x: I had some trouble finding what you were looking for, please try again or be more specific.`
    );
  }
  if (videos.length < 5) {
    player.commandLock = false;
    return interaction.followUp(
      `:x: I had some trouble finding what you were looking for, please try again or be more specific.`
    );
  }
  const vidNameArr = [];
  for (let i = 0; i < videos.length; i++) {
    vidNameArr.push(videos[i].title.slice(0, 99));
  }
  vidNameArr.push('cancel');
  const row = createSelectMenu(vidNameArr);
  const playOptions = await interaction.channel.send({
    content: 'Pick a video',
    components: [row]
  });
  const playOptionsCollector = playOptions.createMessageComponentCollector({
    componentType: 'SELECT_MENU',
    time: MaxResponseTime * 1000
  });
  playOptionsCollector.on('end', async () => {
    if (playOptions) {
      await playOptions.delete().catch(console.error);
    }
  });

  playOptionsCollector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) {
      i.reply({
        content: 'This element is not for you!',
        ephemeral: true
      });
    } else {
      playOptionsCollector.stop();
      const value = i.values[0];
      if (value === 'cancel_option') {
        if (playOptions) {
          interaction.followUp('Search canceled');
          player.commandLock = false;
          return;
        }
      }
      const videoIndex = parseInt(value);

      YouTube.getVideo(
        `https://www.youtube.com/watch?v=${videos[videoIndex - 1].id}`
      )
        .then(function(video) {
          if (video.live && !playLiveStreams) {
            if (playOptions) {
              playOptions.delete().catch(console.error);
              return;
            }
            player.commandLock = false;
            return interaction.followUp(
              'Live streams are disabled in this server! Contact the owner'
            );
          }

          if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
            if (playOptions) {
              playOptions.delete().catch(console.error);
              return;
            }
            player.commandLock = false;
            return interaction.followUp(
              'Videos longer than 1 hour are disabled in this server! Contact the owner'
            );
          }

          if (
            interaction.client.playerManager.get(interaction.guildId).queue
              .length > maxQueueLength
          ) {
            if (playOptions) {
              playOptions.delete().catch(console.error);
              return;
            }
            player.commandLock = false;
            return interaction.followUp(
              `The queue hit its limit of ${maxQueueLength}, please wait a bit before attempting to add more songs`
            );
          }

          if (nextFlag || jumpFlag) {
            interaction.client.playerManager
              .get(interaction.guildId)
              .queue.unshift(
                constructSongObj(video, voiceChannel, interaction.member.user)
              );
            if (
              jumpFlag &&
              interaction.client.playerManager.get(interaction.guildId)
                .audioPlayer.state.status === AudioPlayerStatus.Playing
            ) {
              interaction.client.playerManager.get(
                interaction.guildId
              ).loopSong = false;
              interaction.client.playerManager
                .get(interaction.guildId)
                .audioPlayer.stop();
              return interaction.followUp('Skipped song!');
            }
          } else {
            interaction.client.playerManager
              .get(interaction.guildId)
              .queue.push(
                constructSongObj(video, voiceChannel, interaction.member.user)
              );
          }
          if (
            interaction.client.playerManager.get(interaction.guildId)
              .audioPlayer.state.status !== AudioPlayerStatus.Playing
          ) {
            const player = interaction.client.playerManager.get(
              interaction.guildId
            );
            handleSubscription(player.queue, interaction, player);
          } else if (
            interaction.client.playerManager.get(interaction.guildId)
              .audioPlayer.state.status === AudioPlayerStatus.Playing
          ) {
            player.commandLock = false;
            return interaction.followUp(`Added **${video.title}** to queue`);
          }
          return;
        })
        .catch(error => {
          player.commandLock = false;
          deletePlayerIfNeeded(interaction);
          if (playOptions) playOptions.delete().catch(console.error);
          console.error(error);
          return interaction.followUp(
            'An error has occurred while trying to get the video ID from youtube.'
          );
        });
    }
  });
};

// side effects function
var flagLogic = (interaction, video, jumpFlag) => {
  const player = interaction.client.playerManager.get(interaction.guildId);
  player.queue.splice(
    0,
    0,
    constructSongObj(
      video,
      interaction.member.voice.channel,
      interaction.member.user
    )
  );
  if (
    jumpFlag &&
    player.audioPlayer.state.status === AudioPlayerStatus.Playing
  ) {
    player.loopSong = false;
    player.audioPlayer.stop();
  }
};

/********************************** Helper Functions *****************************/

// var compose = (f, g) => x => f(g(x));

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

var constructSongObj = (video, voiceChannel, user, timestamp) => {
  let duration = video.durationFormatted;
  if (duration === '00:00') duration = 'Live Stream';
  // checks if the user searched for a song using a Spotify URL
  return {
    url: video.url,
    title: video.title,
    rawDuration: video.duration,
    duration,
    timestamp,
    thumbnail: video.thumbnail.url,
    voiceChannel,
    memberDisplayName: user.username,
    memberAvatar: user.avatarURL('webp', false, 16)
  };
};

var createSelectMenu = namesArray =>
  new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId('search-yt-menu')
      .setPlaceholder('Please select a video')
      .addOptions([
        {
          label: `${namesArray[0]}`,
          value: '1'
        },
        {
          label: `${namesArray[1]}`,
          value: '2'
        },
        {
          label: `${namesArray[2]}`,
          value: '3'
        },
        {
          label: `${namesArray[3]}`,
          value: '4'
        },
        {
          label: `${namesArray[4]}`,
          value: '5'
        },
        {
          label: 'Cancel',
          value: 'cancel_option'
        }
      ])
  );

var deletePlayerIfNeeded = interaction => {
  const player = interaction.client.playerManager.get(interaction.guildId);
  if (player) {
    if (
      (player.queue.length && !player.nowPlaying) ||
      (!player.queue.length && !player.nowPlaying)
    )
      return;
    return interaction.client.playerManager.delete(interaction.guildId);
  }
};
