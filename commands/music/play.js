const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['play-song', 'add', 'p'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song or playlist from youtube!',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: ':notes: What song or playlist would you like to listen to?',
          type: 'string',
          validate: function(query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.say(':no_entry: Please join a voice channel and try again!');
      return;
    }

    if (message.guild.triviaData.isTriviaRunning == true) {
      message.say(':x: Please try after the trivia has ended!');
      return;
    }

    if (db.get(message.member.id) !== null) {
      const userPlaylists = db.get(message.member.id).savedPlaylists;
      let found = false;
      let location;
      for (let i = 0; i < userPlaylists.length; i++) {
        if (userPlaylists[i].name == query) {
          found = true;
          location = i;
          break;
        }
      }
      if (found) {
        const embed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(':eyes: Clarification Please.')
          .setDescription(
            `You have a playlist named **${query}**, did you mean to play the playlist or search for **${query}** on YouTube?`
          )
          .addField(':arrow_forward: Playlist', '1. Play saved playlist')
          .addField(':mag: YouTube', '2. Search on YouTube')
          .addField(':x: Cancel', '3. Cancel')
          .setFooter('Choose by commenting a number between 1 and 3.');
        const clarifyEmbed = await message.channel.send({ embed });
        message.channel
          .awaitMessages(
            function onMessage(msg) {
              return msg.content > 0 && msg.content < 4;
            },
            {
              max: 1,
              time: 30000,
              errors: ['time']
            }
          )
          .then(async function onClarifyResponse(response) {
            const msgContent = response.first().content;
            if (msgContent == 1) {
              if (clarifyEmbed) {
                clarifyEmbed.delete();
              }
              const urlsArray = userPlaylists[location].urls;
              if (urlsArray.length == 0) {
                message.reply(
                  `${query} is empty, add songs to it before attempting to play it`
                );
                return;
              }
              for (let i = 0; i < urlsArray.length; i++) {
                message.guild.musicData.queue.push(urlsArray[i]);
              }
              if (message.guild.musicData.isPlaying == true) {
                message.channel.send(
                  `Playlist **${query} has been added to queue**`
                );
              } else if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true;
                PlayCommand.playSong(message.guild.musicData.queue, message);
              }
            } else if (msgContent == 2) {
              await PlayCommand.searchYoutube(query, message, voiceChannel);
              return;
            } else if (msgContent == 3) {
              clarifyEmbed.delete();
              return;
            }
          })
          .catch(function onClarifyError() {
            if (clarifyEmbed) {
              clarifyEmbed.delete();
            }
            return;
          });
        return;
      }
    }

    if (
      // Handles PlayList Links
      query.match(
        /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
      )
    ) {
      const playlist = await youtube.getPlaylist(query).catch(function() {
        message.say(':x: Playlist is either private or it does not exist!');
        return;
      });
      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosArr = await playlist.getVideos().catch(function() {
        message.say(
          ':x: There was a problem getting one of the videos in the playlist!'
        );
        return;
      });

      // Uncomment if you want the bot to automatically shuffle the playlist

      /*for (let i = videosArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videosArr[i], videosArr[j]] = [videosArr[j], videosArr[i]];
      }
      */
      const queueCount = message.guild.musicData.queue.length;
      for (let i = 0; i < videosArr.length; i++) {
        if (
          videosArr[i].raw.status.privacyStatus == 'private' ||
          videosArr[i].raw.status.privacyStatus == 'privacyStatusUnspecified'
        ) {
          continue;
        } else {
          try {
            const video = await videosArr[i].fetch();
            // this can be uncommented if you choose to limit the queue
            // if (message.guild.musicData.queue.length < 10) {
            //
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            // } else {
            //   return message.say(
            //     `I can't play the full playlist because there will be more than 10 songs in queue`
            //   );
            // }
          } catch (err) {
            return console.error(err);
          }
        }
      }
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        // @TODO add the the position number of queue of the when a playlist is added

        const playlistCount = Math.abs(
          queueCount - message.guild.musicData.queue.length
        );
        // Playlist Message
        var embedTitle = ':musical_note: Now Playing';
        if (message.guild.musicData.loopQueue)
          embedTitle = ':repeat: Repeat Queue';
        if (message.guild.musicData.loopSong)
          embedTitle = ':repeat_one: Repeat Song';
        if (message.guild.musicData.songDispatcher.paused == true)
          embedTitle = ':pause_button: Paused';

        const PlayListEmbed = [
          new MessageEmbed()
            .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
            .setColor('#ff0000')
            .addField(
              embedTitle,
              `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})`
            )
            .addField(
              'Duration',
              ':stopwatch: ' + message.guild.musicData.queue[0].duration,
              true
            )
            .addField(
              'Volume',
              ':loud_sound: ' +
                (message.guild.musicData.songDispatcher.volume * 100).toFixed(
                  0
                ) +
                '%',
              true
            )
            .addField(
              'Queue',
              ':notes: ' + message.guild.musicData.queue.length + ' Song(s)',
              true
            )
            .addField(
              'Next Song',
              `:track_next: [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
            )
            .addField(
              'Added Playlist',
              `[${playlist.title}](${playlist.url})
              Adds ${playlistCount} songs to the queue!`
            )
            .setFooter(
              `Requested by ${message.guild.musicData.nowPlaying.memberDisplayName}!`,
              message.guild.musicData.nowPlaying.memberAvatar
            )
        ];

        const channelInfo = message.member.voice.channel.members;
        const rawMembers = Object.fromEntries(channelInfo);
        const memberArray = [Object.keys(rawMembers)];

        const videoEmbed = new Pagination.Embeds()
          .setArray(PlayListEmbed)
          .setAuthorizedUsers(memberArray[0])
          .setDisabledNavigationEmojis(['delete'])
          .setChannel(message.channel)
          // Reaction Controls
          .setFunctionEmojis({
            // Volume Down
            '🔉': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.volume > 0) {
                  for (const embed of instance.array)
                    embed.fields[2].value =
                      ':loud_sound: ' +
                      (
                        (message.guild.musicData.songDispatcher.volume - 0.01) *
                        100
                      ).toFixed(0) +
                      '%';
                  message.guild.musicData.songDispatcher.setVolume(
                    message.guild.musicData.songDispatcher.volume - 0.01
                  );
                  db.set(
                    `${message.member.guild.id}.serverSettings.volume`,
                    message.guild.musicData.songDispatcher.volume
                  );
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Volume Up
            '🔊': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.volume < 2) {
                  for (const embed of instance.array)
                    embed.fields[2].value =
                      ':loud_sound: ' +
                      (
                        (message.guild.musicData.songDispatcher.volume + 0.01) *
                        100
                      ).toFixed(0) +
                      '%';
                  message.guild.musicData.songDispatcher.setVolume(
                    message.guild.musicData.songDispatcher.volume + 0.01
                  );
                  db.set(
                    `${message.member.guild.id}.serverSettings.volume`,
                    message.guild.musicData.songDispatcher.volume
                  );
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Stop
            '⏹️': (_, instance) => {
              try {
                for (const embed of instance.array)
                  embed.fields[0].name = ':stop_button: Stopped';

                if (message.guild.musicData.songDispatcher.paused == true) {
                  message.guild.musicData.songDispatcher.resume();
                  message.guild.musicData.queue.length = 0;
                  message.guild.musicData.loopSong = false;
                  setTimeout(() => {
                    message.guild.musicData.songDispatcher.end();
                  }, 100);
                  videoEmbed.setTimeout(0);
                } else {
                  message.guild.musicData.queue.length = 0;
                  message.guild.musicData.skipTimer = true;
                  message.guild.musicData.loopSong = false;
                  message.guild.musicData.loopQueue = false;
                  message.guild.musicData.songDispatcher.end();
                  videoEmbed.setTimeout(100);
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Play/Pause
            '⏯️': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.paused == false) {
                  message.guild.musicData.songDispatcher.pause();
                  for (const embed of instance.array)
                    embed.fields[0].name = ':pause_button: Paused';
                } else {
                  for (const embed of instance.array)
                    embed.fields[0].name = ':musical_note: Now Playing';
                  message.guild.musicData.songDispatcher.resume();
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            }
          });
        // Next track
        videoEmbed
          .addFunctionEmoji('⏭️', (_, instance) => {
            try {
              for (const embed of instance.array)
                embed.fields[0].name = ':next_track: Skipped';
              if (message.guild.musicData.songDispatcher.paused == true)
                message.guild.musicData.songDispatcher.resume();
              message.guild.musicData.loopSong = false;
              setTimeout(() => {
                message.guild.musicData.songDispatcher.end();
              }, 100);
              videoEmbed.setTimeout(0);
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          })
          // Repeat Queue
          .addFunctionEmoji('🔁', (_, instance) => {
            try {
              if (message.guild.musicData.loopQueue) {
                for (const embed of instance.array)
                  embed.fields[0].name = ':musical_note: Now Playing';
                message.guild.musicData.loopQueue = false;
              } else {
                for (const embed of instance.array)
                  embed.fields[0].name = ':repeat: Repeat Queue';
                message.guild.musicData.loopQueue = true;
              }
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          });

        videoEmbed.build();
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (
      query.match(/^(http(s)?:\/\/)?(m.)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)
    ) {
      query = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      let failedToGetVideo = false;
      const video = await youtube.getVideoByID(id).catch(function() {
        message.say(':x: There was a problem getting the video you provided!');
        failedToGetVideo = true;
      });
      if (failedToGetVideo) return;
      // // can be uncommented if you don't want the bot to play live streams
      // if (video.raw.snippet.liveBroadcastContent === 'live') {
      //   return message.say("I don't support live streams!");
      // }
      // // can be uncommented if you don't want the bot to play videos longer than 1 hour
      // if (video.duration.hours !== 0) {
      //   return message.say('I cannot play videos longer than 1 hour');
      // }
      // // can be uncommented if you want to limit the queue
      // if (message.guild.musicData.queue.length > 10) {
      //   return message.say(
      //     'There are too many songs in the queue already, skip or wait a bit'
      //   );
      // }
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(video, voiceChannel, message.member.user)
      );
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message);
      } else if (message.guild.musicData.isPlaying == true) {
        // Added to Queue Message (Link)
        var embedTitle = ':musical_note: Now Playing';
        if (message.guild.musicData.loopQueue)
          embedTitle = ':repeat: Repeat Queue';
        if (message.guild.musicData.loopSong)
          embedTitle = ':repeat_one: Repeat Song';
        if (message.guild.musicData.songDispatcher.paused == true)
          embedTitle = ':pause_button: Paused';

        const addedEmbed = [
          new MessageEmbed()
            .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
            .setColor('#ff0000')
            .addField(
              embedTitle,
              `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})`
            )
            .addField(
              'Duration',
              ':stopwatch: ' + message.guild.musicData.queue[0].duration,
              true
            )
            .addField(
              'Volume',
              ':loud_sound: ' +
                (message.guild.musicData.songDispatcher.volume * 100).toFixed(
                  0
                ) +
                '%',
              true
            )
            .addField(
              'Queue',
              ':notes: ' + message.guild.musicData.queue.length + ' Song(s)',
              true
            )
            .addField(
              'Next Song',
              `:track_next: [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
            )
            .addField('Added to Queue', `[${video.title}](${video.url})`)
            .setFooter(
              `Requested by ${message.guild.musicData.nowPlaying.memberDisplayName}!`,
              message.guild.musicData.nowPlaying.memberAvatar
            )
        ];

        const channelInfo = message.member.voice.channel.members;
        const rawMembers = Object.fromEntries(channelInfo);
        const memberArray = [Object.keys(rawMembers)];

        const videoEmbed = new Pagination.Embeds()
          .setArray(addedEmbed)
          .setAuthorizedUsers(memberArray[0])
          .setDisabledNavigationEmojis(['delete'])
          .setChannel(message.channel)
          // Reaction Controls
          .setFunctionEmojis({
            // Volume Down
            '🔉': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.volume > 0) {
                  for (const embed of instance.array)
                    embed.fields[2].value =
                      ':loud_sound: ' +
                      (
                        (message.guild.musicData.songDispatcher.volume - 0.01) *
                        100
                      ).toFixed(0) +
                      '%';
                  message.guild.musicData.songDispatcher.setVolume(
                    message.guild.musicData.songDispatcher.volume - 0.01
                  );
                  db.set(
                    `${message.member.guild.id}.serverSettings.volume`,
                    message.guild.musicData.songDispatcher.volume
                  );
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Volume Up
            '🔊': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.volume < 2) {
                  for (const embed of instance.array)
                    embed.fields[2].value =
                      ':loud_sound: ' +
                      (
                        (message.guild.musicData.songDispatcher.volume + 0.01) *
                        100
                      ).toFixed(0) +
                      '%';
                  message.guild.musicData.songDispatcher.setVolume(
                    message.guild.musicData.songDispatcher.volume + 0.01
                  );
                  db.set(
                    `${message.member.guild.id}.serverSettings.volume`,
                    message.guild.musicData.songDispatcher.volume
                  );
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Stop
            '⏹️': (_, instance) => {
              try {
                for (const embed of instance.array)
                  embed.fields[0].name = ':stop_button: Stopped';

                if (message.guild.musicData.songDispatcher.paused == true) {
                  message.guild.musicData.songDispatcher.resume();
                  message.guild.musicData.queue.length = 0;
                  message.guild.musicData.loopSong = false;
                  setTimeout(() => {
                    message.guild.musicData.songDispatcher.end();
                  }, 100);
                  videoEmbed.setTimeout(0);
                } else {
                  message.guild.musicData.queue.length = 0;
                  message.guild.musicData.skipTimer = true;
                  message.guild.musicData.loopSong = false;
                  message.guild.musicData.loopQueue = false;
                  message.guild.musicData.songDispatcher.end();
                  videoEmbed.setTimeout(100);
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            },
            // Play/Pause
            '⏯️': (_, instance) => {
              try {
                if (message.guild.musicData.songDispatcher.paused == false) {
                  message.guild.musicData.songDispatcher.pause();
                  for (const embed of instance.array)
                    embed.fields[0].name = ':pause_button: Paused';
                } else {
                  for (const embed of instance.array)
                    embed.fields[0].name = ':musical_note: Now Playing';
                  message.guild.musicData.songDispatcher.resume();
                }
              } catch (error) {
                message.say(':x: Something went wrong');
                console.log(error);
              }
            }
          });
        // Next track
        videoEmbed
          .addFunctionEmoji('⏭️', (_, instance) => {
            try {
              for (const embed of instance.array)
                embed.fields[0].name = ':next_track: Skipped';
              if (message.guild.musicData.songDispatcher.paused == true)
                message.guild.musicData.songDispatcher.resume();
              message.guild.musicData.loopSong = false;
              setTimeout(() => {
                message.guild.musicData.songDispatcher.end();
              }, 100);
              videoEmbed.setTimeout(0);
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          })
          // Repeat Queue
          .addFunctionEmoji('🔁', (_, instance) => {
            try {
              if (message.guild.musicData.loopQueue) {
                for (const embed of instance.array)
                  embed.fields[0].name = ':musical_note: Now Playing';
                message.guild.musicData.loopQueue = false;
              } else {
                for (const embed of instance.array)
                  embed.fields[0].name = ':repeat: Repeat Queue';
                message.guild.musicData.loopQueue = true;
              }
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          });

        videoEmbed.build();
        return;
      }
    }

    // if user provided a song/video name
    await PlayCommand.searchYoutube(query, message, voiceChannel);
  }
  static playSong(queue, message) {
    const classThis = this; // use classThis instead of 'this' because of lexical scope below
    if (queue[0].voiceChannel == undefined) {
      // happens when loading a saved playlist
      queue[0].voiceChannel = message.member.voice.channel;
    }
    if (message.guild.me.voice.channel !== null) {
      if (message.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
        queue[0].voiceChannel = message.guild.me.voice.channel;
      }
    }
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              filter: 'audio',
              quality: 'highestaudio',
              highWaterMark: 1 << 25
            })
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            // Volume Settings
            if (!db.get(`${message.guild.id}.serverSettings.volume`))
              dispatcher.setVolume(message.guild.musicData.volume);
            else
              dispatcher.setVolume(
                db.get(`${message.guild.id}.serverSettings.volume`)
              );
            var embedTitle = ':musical_note: Now Playing';
            if (message.guild.musicData.loopQueue)
              embedTitle = ':repeat: Repeat Queue';
            if (message.guild.musicData.loopSong)
              embedTitle = ':repeat_one: Repeat Song';

            const nowPlayingArr = [
              new MessageEmbed()
                .setThumbnail(queue[0].thumbnail)
                .setColor('#ff0000')
                .addField(embedTitle, `[${queue[0].title}](${queue[0].url})`)
                .addField('Duration', ':stopwatch: ' + queue[0].duration, true)
                .addField(
                  'Volume',
                  ':loud_sound: ' + (dispatcher.volume * 100).toFixed(0) + '%',
                  true
                )
                .setFooter(
                  `Requested by ${queue[0].memberDisplayName}!`,
                  queue[0].memberAvatar
                )
            ];

            const channelInfo = message.member.voice.channel.members;
            const rawMembers = Object.fromEntries(channelInfo);
            const memberArray = [Object.keys(rawMembers)];

            const videoEmbed = new Pagination.Embeds()
              .setArray(nowPlayingArr)
              .setAuthorizedUsers(memberArray[0])
              .setDisabledNavigationEmojis(['delete'])
              .setChannel(message.channel)
              // Reaction Controls
              .setFunctionEmojis({
                // Volume Down
                '🔉': (_, instance) => {
                  try {
                    if (dispatcher.volume > 0) {
                      for (const embed of instance.array)
                        embed.fields[2].value =
                          ':loud_sound: ' +
                          ((dispatcher.volume - 0.01) * 100).toFixed(0) +
                          '%';
                      dispatcher.setVolume(dispatcher.volume - 0.01);
                      db.set(
                        `${message.member.guild.id}.serverSettings.volume`,
                        dispatcher.volume
                      );
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                },
                // Volume Up
                '🔊': (_, instance) => {
                  try {
                    if (dispatcher.volume < 2) {
                      for (const embed of instance.array)
                        embed.fields[2].value =
                          ':loud_sound: ' +
                          ((dispatcher.volume + 0.01) * 100).toFixed(0) +
                          '%';
                      dispatcher.setVolume(dispatcher.volume + 0.01);
                      db.set(
                        `${message.member.guild.id}.serverSettings.volume`,
                        dispatcher.volume
                      );
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                },
                // Stop
                '⏹️': (_, instance) => {
                  try {
                    for (const embed of instance.array)
                      embed.fields[0].name = ':stop_button: Stopped';

                    if (message.guild.musicData.songDispatcher.paused == true) {
                      message.guild.musicData.songDispatcher.resume();
                      message.guild.musicData.queue.length = 0;
                      message.guild.musicData.loopSong = false;
                      setTimeout(() => {
                        message.guild.musicData.songDispatcher.end();
                      }, 100);
                      videoEmbed.setTimeout(0);
                    } else {
                      message.guild.musicData.queue.length = 0;
                      message.guild.musicData.skipTimer = true;
                      message.guild.musicData.loopSong = false;
                      message.guild.musicData.loopQueue = false;
                      message.guild.musicData.songDispatcher.end();
                      videoEmbed.setTimeout(100);
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                },
                // Play/Pause
                '⏯️': (_, instance) => {
                  try {
                    if (
                      message.guild.musicData.songDispatcher.paused == false
                    ) {
                      message.guild.musicData.songDispatcher.pause();
                      for (const embed of instance.array)
                        embed.fields[0].name = ':pause_button: Paused';
                    } else {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':musical_note: Now Playing';
                      message.guild.musicData.songDispatcher.resume();
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                }
              });

            if (
              message.guild.musicData.queue.length > 1 &&
              !message.guild.musicData.loopSong
            ) {
              videoEmbed
                .addField(
                  'Queue',
                  ':notes: ' +
                    [message.guild.musicData.queue.length - 1] +
                    ' Song(s)',
                  true
                )
                .addField(
                  'Next Song',
                  `:track_next: [${queue[1].title}](${queue[1].url})`
                )
                // Next track
                .addFunctionEmoji('⏭️', (_, instance) => {
                  try {
                    for (const embed of instance.array)
                      embed.fields[0].name = ':next_track: Skipped';
                    if (message.guild.musicData.songDispatcher.paused == true)
                      message.guild.musicData.songDispatcher.resume();
                    message.guild.musicData.loopSong = false;
                    setTimeout(() => {
                      message.guild.musicData.songDispatcher.end();
                    }, 100);
                    videoEmbed.setTimeout(0);
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                })
                // Repeat Queue
                .addFunctionEmoji('🔁', (_, instance) => {
                  try {
                    if (message.guild.musicData.loopQueue) {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':musical_note: Now Playing';
                      message.guild.musicData.loopQueue = false;
                    } else {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':repeat: Repeat Queue';
                      message.guild.musicData.loopQueue = true;
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                });
            } else
              videoEmbed.addFunctionEmoji(
                // Repeat
                '🔂',
                (_, instance) => {
                  try {
                    if (message.guild.musicData.loopSong) {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':musical_note: Now Playing';
                      message.guild.musicData.loopSong = false;
                    } else {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':repeat_one: Repeat Song';
                      message.guild.musicData.loopSong = true;
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                }
              );
            videoEmbed.build();

            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            return;
          })
          .on('finish', function() {
            queue = message.guild.musicData.queue;
            if (message.guild.musicData.loopSong) {
              queue.unshift(message.guild.musicData.nowPlaying);
            } else if (message.guild.musicData.loopQueue) {
              queue.push(message.guild.musicData.nowPlaying);
            }
            if (queue.length >= 1) {
              classThis.playSong(queue, message);
              return;
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (
                message.guild.me.voice.channel &&
                message.guild.musicData.skipTimer
              ) {
                message.guild.me.voice.channel.leave();
                message.guild.musicData.skipTimer = false;
                return;
              }
              if (message.guild.me.voice.channel) {
                setTimeout(function onTimeOut() {
                  if (
                    message.guild.musicData.isPlaying == false &&
                    message.guild.me.voice.channel
                  ) {
                    message.guild.me.voice.channel.leave();
                    message.channel.send(
                      ':zzz: Left channel due to inactivity.'
                    );
                  }
                }, 90000);
              }
            }
          })
          .on('error', function(e) {
            message.say(':x: Cannot play song!');
            console.error(e);
            if (queue.length > 1) {
              queue.shift();
              classThis.playSong(queue, message);
              return;
            }
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.loopSong = false;
            message.guild.musicData.songDispatcher = null;
            message.guild.me.voice.channel.leave();
            return;
          });
      })
      .catch(function() {
        message.say(':no_entry: I have no permission to join your channel!');
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.isPlaying = false;
        message.guild.musicData.nowPlaying = null;
        message.guild.musicData.loopSong = false;
        message.guild.musicData.songDispatcher = null;
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
        }
        return;
      });
  }

  static async searchYoutube(query, message, voiceChannel) {
    const videos = await youtube.searchVideos(query, 5).catch(async function() {
      await message.say(
        ':x: There was a problem searching the video you requested!'
      );
      return;
    });
    if (videos.length < 5 || !videos) {
      message.say(
        `:x: I had some trouble finding what you were looking for, please try again or be more specific.`
      );
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(
        `${i + 1}: [${videos[i].title
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")}](${videos[i].shortURL})`
      );
    }
    vidNameArr.push('cancel');
    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`:mag: Search Results!`)
      .addField(':notes: Result 1', vidNameArr[0])
      .setURL(videos[0].url)
      .addField(':notes: Result 2', vidNameArr[1])
      .addField(':notes: Result 3', vidNameArr[2])
      .addField(':notes: Result 4', vidNameArr[3])
      .addField(':notes: Result 5', vidNameArr[4])
      .setThumbnail(videos[0].thumbnails.high.url)
      .setFooter('Choose a song by commenting a number between 1 and 5')
      .addField(':x: Cancel', 'to cancel ');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (
            (msg.content > 0 && msg.content < 6) || msg.content === 'cancel'
          );
        },
        {
          max: 1,
          time: 60000,
          errors: ['time']
        }
      )
      .then(function(response) {
        const videoIndex = parseInt(response.first().content);
        if (response.first().content === 'cancel') {
          songEmbed.delete();
          return;
        }
        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(function(video) {
            // // can be uncommented if you don't want the bot to play live streams
            // if (video.raw.snippet.liveBroadcastContent === 'live') {
            //   songEmbed.delete();
            //   return message.say("I don't support live streams!");
            // }

            // // can be uncommented if you don't want the bot to play videos longer than 1 hour
            // if (video.duration.hours !== 0) {
            //   songEmbed.delete();
            //   return message.say('I cannot play videos longer than 1 hour');
            // }

            // // can be uncommented if you don't want to limit the queue
            // if (message.guild.musicData.queue.length > 10) {
            //   songEmbed.delete();
            //   return message.say(
            //     'There are too many songs in the queue already, skip or wait a bit'
            //   );
            // }
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              if (songEmbed) {
                songEmbed.delete();
              }
              PlayCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
              if (songEmbed) {
                songEmbed.delete();
              }
              // Added Song Message (Search)
              var embedTitle = ':musical_note: Now Playing';
              if (message.guild.musicData.loopQueue)
                embedTitle = ':repeat: Repeat Queue';
              if (message.guild.musicData.loopSong)
                embedTitle = ':repeat_one: Repeat Song';
              if (message.guild.musicData.songDispatcher.paused == true)
                embedTitle = ':pause_button: Paused';

              const addedEmbed = [
                new MessageEmbed()
                  .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
                  .setColor('#ff0000')
                  .addField(
                    embedTitle,
                    `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})`
                  )
                  .addField(
                    'Duration',
                    ':stopwatch: ' + message.guild.musicData.queue[0].duration,
                    true
                  )
                  .addField(
                    'Volume',
                    ':loud_sound: ' +
                      (
                        message.guild.musicData.songDispatcher.volume * 100
                      ).toFixed(0) +
                      '%',
                    true
                  )
                  .addField(
                    'Queue',
                    ':notes: ' +
                      message.guild.musicData.queue.length +
                      ' Song(s)',
                    true
                  )
                  .addField(
                    'Next Song',
                    `:track_next: [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
                  )
                  .addField('Added to Queue', `[${video.title}](${video.url})`)
                  .setFooter(
                    `Requested by ${message.guild.musicData.nowPlaying.memberDisplayName}!`,
                    message.guild.musicData.nowPlaying.memberAvatar
                  )
              ];

              const channelInfo = message.member.voice.channel.members;
              const rawMembers = Object.fromEntries(channelInfo);
              const memberArray = [Object.keys(rawMembers)];

              const videoEmbed = new Pagination.Embeds()
                .setArray(addedEmbed)
                .setAuthorizedUsers(memberArray[0])
                .setDisabledNavigationEmojis(['delete'])
                .setChannel(message.channel)
                // Reaction Controls
                .setFunctionEmojis({
                  // Volume Down
                  '🔉': (_, instance) => {
                    try {
                      if (message.guild.musicData.songDispatcher.volume > 0) {
                        for (const embed of instance.array)
                          embed.fields[2].value =
                            ':loud_sound: ' +
                            (
                              (message.guild.musicData.songDispatcher.volume -
                                0.01) *
                              100
                            ).toFixed(0) +
                            '%';
                        message.guild.musicData.songDispatcher.setVolume(
                          message.guild.musicData.songDispatcher.volume - 0.01
                        );
                        db.set(
                          `${message.member.guild.id}.serverSettings.volume`,
                          message.guild.musicData.songDispatcher.volume
                        );
                      }
                    } catch (error) {
                      message.say(':x: Something went wrong');
                      console.log(error);
                    }
                  },
                  // Volume Up
                  '🔊': (_, instance) => {
                    try {
                      if (message.guild.musicData.songDispatcher.volume < 2) {
                        for (const embed of instance.array)
                          embed.fields[2].value =
                            ':loud_sound: ' +
                            (
                              (message.guild.musicData.songDispatcher.volume +
                                0.01) *
                              100
                            ).toFixed(0) +
                            '%';
                        message.guild.musicData.songDispatcher.setVolume(
                          message.guild.musicData.songDispatcher.volume + 0.01
                        );
                        db.set(
                          `${message.member.guild.id}.serverSettings.volume`,
                          message.guild.musicData.songDispatcher.volume
                        );
                      }
                    } catch (error) {
                      message.say(':x: Something went wrong');
                      console.log(error);
                    }
                  },
                  // Stop
                  '⏹️': (_, instance) => {
                    try {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':stop_button: Stopped';

                      if (
                        message.guild.musicData.songDispatcher.paused == true
                      ) {
                        message.guild.musicData.songDispatcher.resume();
                        message.guild.musicData.queue.length = 0;
                        message.guild.musicData.loopSong = false;
                        setTimeout(() => {
                          message.guild.musicData.songDispatcher.end();
                        }, 100);
                        videoEmbed.setTimeout(0);
                      } else {
                        message.guild.musicData.queue.length = 0;
                        message.guild.musicData.skipTimer = true;
                        message.guild.musicData.loopSong = false;
                        message.guild.musicData.loopQueue = false;
                        message.guild.musicData.songDispatcher.end();
                        videoEmbed.setTimeout(100);
                      }
                    } catch (error) {
                      message.say(':x: Something went wrong');
                      console.log(error);
                    }
                  },
                  // Play/Pause
                  '⏯️': (_, instance) => {
                    try {
                      if (
                        message.guild.musicData.songDispatcher.paused == false
                      ) {
                        message.guild.musicData.songDispatcher.pause();
                        for (const embed of instance.array)
                          embed.fields[0].name = ':pause_button: Paused';
                      } else {
                        for (const embed of instance.array)
                          embed.fields[0].name = ':musical_note: Now Playing';
                        message.guild.musicData.songDispatcher.resume();
                      }
                    } catch (error) {
                      message.say(':x: Something went wrong');
                      console.log(error);
                    }
                  }
                });
              // Next track
              videoEmbed
                .addFunctionEmoji('⏭️', (_, instance) => {
                  try {
                    for (const embed of instance.array)
                      embed.fields[0].name = ':next_track: Skipped';
                    if (message.guild.musicData.songDispatcher.paused == true)
                      message.guild.musicData.songDispatcher.resume();
                    message.guild.musicData.loopSong = false;
                    setTimeout(() => {
                      message.guild.musicData.songDispatcher.end();
                    }, 100);
                    videoEmbed.setTimeout(0);
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                })
                // Repeat Queue
                .addFunctionEmoji('🔁', (_, instance) => {
                  try {
                    if (message.guild.musicData.loopQueue) {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':musical_note: Now Playing';
                      message.guild.musicData.loopQueue = false;
                    } else {
                      for (const embed of instance.array)
                        embed.fields[0].name = ':repeat: Repeat Queue';
                      message.guild.musicData.loopQueue = true;
                    }
                  } catch (error) {
                    message.say(':x: Something went wrong');
                    console.log(error);
                  }
                });

              videoEmbed.build();
              return;
            }
          })
          .catch(function() {
            if (songEmbed) {
              songEmbed.delete();
            }
            message.say(
              ':x: An error has occured when trying to get the video ID from youtube.'
            );
            return;
          });
      })
      .catch(function() {
        if (songEmbed) {
          songEmbed.delete();
        }
        message.say(
          ':x: Please try again and enter a number between 1 and 5 or cancel.'
        );
        return;
      });
  }

  static constructSongObj(video, voiceChannel, user) {
    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }
  // prettier-ignore
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
};
