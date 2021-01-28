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
                // Saved Playlist Added to Queue Message
                PlayCommand.createResponse(message)
                  .addField(
                    'Added Playlist',
                    `:new: **${query}** added ${urlsArray.length} songs to the queue!`
                  )
                  .build();
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

        const playlistCount = message.guild.musicData.queue.length - queueCount;
        // Added playlist to queue message
        PlayCommand.createResponse(message)
          .addField(
            'Added Playlist',
            `[${playlist.title}](${playlist.url})
              Adds ${playlistCount} songs to the queue!`
          )
          .build();
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
        // Added song to queue message (link/url)

        PlayCommand.createResponse(message)
          .addField('Added to Queue', `:new: [${video.title}](${video.url})`)
          .build();
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

            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            // Main Message
            PlayCommand.createResponse(message).build();
          })
          .on('finish', function() {
            // Save the volume when the song ends
            db.set(
              `${message.member.guild.id}.serverSettings.volume`,
              message.guild.musicData.songDispatcher.volume
            );

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
              // Added song to queue message (search)
              PlayCommand.createResponse(message)
                .addField(
                  'Added to Queue',
                  `:new: [${video.title}](${video.url})`
                )
                .build();
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
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${durationObj.minutes ? durationObj.minutes : '00'
      }:${(durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
          ? durationObj.seconds
          : '00')
      }`;
    return duration;
  }

  // Create Embed Messages
  static createResponse(message) {
    // Builds Member ID Array for buttons
    const channelInfo = message.member.voice.channel.members;
    const rawMembers = Object.fromEntries(channelInfo);
    const memberArray = [Object.keys(rawMembers)];

    const songTitle = `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})\n`;

    const embed = new MessageEmbed()
      .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
      .setColor('#ff0000')
      .addField(
        'Duration',
        ':stopwatch: ' + message.guild.musicData.nowPlaying.duration,
        true
      )
      .addField(
        'Volume',
        ':loud_sound: ' +
          (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
          '%',
        true
      )
      .setFooter(
        `Requested by ${message.guild.musicData.nowPlaying.memberDisplayName}!`,
        message.guild.musicData.nowPlaying.memberAvatar
      );

    const videoEmbed = new Pagination.Embeds()
      .setArray([embed])
      .setAuthorizedUsers(memberArray[0])
      .setDisabledNavigationEmojis(['all'])
      .setChannel(message.channel)
      //.setDeleteOnTimeout(true)
      .setTimeout(buttonTimer(message))
      .setTitle(embedTitle(message))
      .setDescription(songTitle + PlayCommand.playbackBar(message))
      // Reaction Controls
      .setFunctionEmojis({
        // Volume Down Button
        '🔉': function(_, instance) {
          if (!message.guild.musicData.songDispatcher) return;

          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTimeout(buttonTimer(message));

          if (message.guild.musicData.songDispatcher.volume > 0) {
            message.guild.musicData.songDispatcher.setVolume(
              message.guild.musicData.songDispatcher.volume - 0.01
            );
            const embed = instance.array[0];
            embed.fields[1].value =
              ':loud_sound: ' +
              (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
              '%';
          }
        },
        // Volume Up Button
        '🔊': function(_, instance) {
          if (!message.guild.musicData.songDispatcher) return;

          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTimeout(buttonTimer(message));

          if (message.guild.musicData.songDispatcher.volume < 2) {
            message.guild.musicData.songDispatcher.setVolume(
              message.guild.musicData.songDispatcher.volume + 0.01
            );
            const embed = instance.array[0];
            embed.fields[1].value =
              ':loud_sound: ' +
              (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
              '%';
          }
        },
        // Stop Button
        '⏹️': function() {
          if (!message.guild.musicData.songDispatcher) return;

          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTitle(':stop_button: Stopped')
            .setTimeout(100);

          if (message.guild.musicData.songDispatcher.paused == true) {
            message.guild.musicData.songDispatcher.resume();
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.loopSong = false;
            message.guild.musicData.loopQueue = false;
            setTimeout(() => {
              message.guild.musicData.songDispatcher.end();
            }, 100);
          } else {
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.skipTimer = true;
            message.guild.musicData.loopSong = false;
            message.guild.musicData.loopQueue = false;
            message.guild.musicData.songDispatcher.end();
          }
        },
        // Play/Pause Button
        '⏯️': function() {
          if (!message.guild.musicData.songDispatcher) return;

          if (message.guild.musicData.songDispatcher.paused == false) {
            message.guild.musicData.songDispatcher.pause();
            videoEmbed
              .setDescription(songTitle + PlayCommand.playbackBar(message))
              .setTitle(embedTitle(message))
              .setTimeout(600000);
          } else {
            message.guild.musicData.songDispatcher.resume();

            videoEmbed
              .setDescription(songTitle + PlayCommand.playbackBar(message))
              .setTitle(embedTitle(message))
              .setTimeout(buttonTimer(message));
          }
        }
      });

    if (message.guild.musicData.queue.length > 0) {
      videoEmbed
        .addField(
          'Queue',
          ':notes: ' + message.guild.musicData.queue.length + ' Song(s)',
          true
        )
        .addField(
          'Next Song',
          `:track_next: [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
        )
        // Next track Button
        .addFunctionEmoji('⏭️', function() {
          if (!message.guild.musicData.songDispatcher) return;

          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTitle(':next_track: Skipped')
            .setTimeout(100);
          if (message.guild.musicData.songDispatcher.paused == true)
            message.guild.musicData.songDispatcher.resume();
          message.guild.musicData.loopSong = false;
          setTimeout(() => {
            message.guild.musicData.songDispatcher.end();
          }, 100);
        })
        // Repeat One Song Button
        .addFunctionEmoji('🔂', function() {
          if (!message.guild.musicData.songDispatcher) return;

          if (message.guild.musicData.loopSong) {
            message.guild.musicData.loopSong = false;
          } else {
            message.guild.musicData.loopQueue = false;
            message.guild.musicData.loopSong = true;
          }
          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTitle(embedTitle(message))
            .setTimeout(buttonTimer(message));
        })
        // Repeat Queue Button
        .addFunctionEmoji('🔁', function() {
          if (!message.guild.musicData.songDispatcher) return;

          if (message.guild.musicData.loopQueue)
            message.guild.musicData.loopQueue = false;
          else {
            message.guild.musicData.loopSong = false;
            message.guild.musicData.loopQueue = true;
          }
          videoEmbed
            .setDescription(songTitle + PlayCommand.playbackBar(message))
            .setTitle(embedTitle(message))
            .setTimeout(buttonTimer(message));
        });
    } else {
      // Repeat One Song Button (when queue is 0)
      videoEmbed.addFunctionEmoji('🔂', function() {
        if (!message.guild.musicData.songDispatcher) return;

        if (message.guild.musicData.loopSong) {
          message.guild.musicData.loopSong = false;
        } else {
          message.guild.musicData.loopQueue = false;
          message.guild.musicData.loopSong = true;
        }
        videoEmbed
          .setDescription(songTitle + PlayCommand.playbackBar(message))
          .setTitle(embedTitle(message))
          .setTimeout(buttonTimer(message));
      });
    }
    return videoEmbed;

    function buttonTimer(message) {
      let timer;
      const totalDurationObj = message.guild.musicData.nowPlaying.rawDuration;
      let totalDurationInMS = 0;
      Object.keys(totalDurationObj).forEach(function(key) {
        if (key == 'hours') {
          totalDurationInMS =
            totalDurationInMS + totalDurationObj[key] * 3600000;
        } else if (key == 'minutes') {
          totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
        } else if (key == 'seconds') {
          totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 1000;
        }
      });

      timer =
        totalDurationInMS -
        message.guild.musicData.songDispatcher.streamTime +
        30000; // allows for controls near the end of the song
      //if (timer > 300000) timer = 300000; // 5min timer limit

      if (totalDurationInMS == 0) timer = 300000; // 5min timer for Live Streams
      return timer;
    }

    function embedTitle(message) {
      let embedTitle = ':musical_note: Now Playing';
      if (message.guild.musicData.loopQueue)
        embedTitle = embedTitle + ' :repeat: Queue';
      if (message.guild.musicData.loopSong)
        embedTitle = embedTitle + ' :repeat_one: Song';
      if (message.guild.musicData.songDispatcher.paused)
        embedTitle = ':pause_button: Paused';

      return embedTitle;
    }
  }

  static playbackBar(message) {
    if (message.guild.musicData.nowPlaying.duration == 'Live Stream') {
      const noPlayBackBar = '';
      return noPlayBackBar;
    }

    const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
    const passedTimeInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
    };
    const passedTimeFormatted = PlayCommand.formatDuration(passedTimeInMSObj);

    const totalDurationObj = message.guild.musicData.nowPlaying.rawDuration;
    const totalDurationFormatted = PlayCommand.formatDuration(totalDurationObj);

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 1000;
      }
    });
    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );
    let playBack = '';
    for (let i = 1; i < 21; i++) {
      if (playBackBarLocation == 0) {
        playBack = ':musical_note:▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬:musical_note:';
        break;
      } else if (i == playBackBarLocation * 2) {
        playBack = playBack + ':musical_note:';
      } else {
        playBack = playBack + '▬';
      }
    }
    playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
    return playBack;
  }
};
