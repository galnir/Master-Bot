const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const db = require('quick.db');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Display the currently playing song!'
    });
  }

  run(message) {
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    const video = message.guild.musicData.nowPlaying;
    let description;
    if (video.duration == 'Live Stream') {
      description = ':red_circle: Live Stream';
    } else {
      description = NowPlayingCommand.playbackBar(message, video);
    }

    var embedTitle = `:musical_note: ${video.title}`;

    if (message.guild.musicData.loopQueue == true)
      embedTitle = `:repeat: ${video.title} **Queue On Loop**`;
    if (message.guild.musicData.loopSong == true)
      embedTitle = `:repeat_one: ${video.title} **On Loop**'`;

    var nowPlayingArr = [
      new MessageEmbed()
        .setThumbnail(video.thumbnail)
        .setColor('#e9f931')
        .setTitle(embedTitle)
        .setURL(video.url)
        .setDescription(description)
        .addField(
          'Volume',
          ':loud_sound: ' +
            (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
            '%',
          true
        )
    ];

    var pauseTimer;

    var videoEmbed = new Pagination.Embeds()
      .setArray(nowPlayingArr)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setDisabledNavigationEmojis(['delete'])
      .setFunctionEmojis({
        // Volume down
        '🔉': (_, instance) => {
          try {
            if (message.guild.musicData.songDispatcher.volume > 0) {
              for (const embed of instance.array)
                embed.fields[0].value =
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

        // Volume up
        '🔊': (_, instance) => {
          try {
            if (message.guild.musicData.songDispatcher.volume < 2) {
              for (const embed of instance.array)
                embed.fields[0].value =
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
          for (const embed of instance.array)
            embed.title = `:stop_button: ${video.title}`;

          try {
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
              for (const embed of instance.array)
                embed.title = `:pause_button: ${video.title}`;
              videoEmbed.setTimeout(600000);
              message.guild.musicData.songDispatcher.pause();
              // Leaves Channel if paused for 10 min
              startPauseTimer();
            } else {
              for (const embed of instance.array)
                embed.title = `:musical_note: ${video.title}`;
              videoEmbed.setTimeout(30000);
              message.guild.musicData.songDispatcher.resume();
              stopPauseTimer();
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
          ':notes: '[message.guild.musicData.queue.length - 1] + ' Song(s)',
          true
        )
        .addField(
          ':track_next: Next Song',
          `[${message.guild.musicData.queue[1].title}](${message.guild.musicData.queue[1].url})`
        )

        // Next track
        .addFunctionEmoji('⏭️', _ => {
          try {
            if (message.guild.musicData.songDispatcher.paused == true)
              message.guild.musicData.songDispatcher.resume();
            stopPauseTimer();
            videoEmbed.setTimeout(100);
            message.guild.musicData.loopSong = false;
            setTimeout(() => {
              message.guild.musicData.songDispatcher.end();
            }, 100);
          } catch (error) {
            message.say(':x: Something went wrong' + error);
            console.log(error);
          }
        })

        // Repeat Queue
        .addFunctionEmoji('🔁', (_, instance) => {
          try {
            if (message.guild.musicData.loopQueue) {
              for (const embed of instance.array)
                embed.title = `:musical_note: ${video.title}`;
              message.guild.musicData.loopQueue = false;
            } else {
              for (const embed of instance.array)
                embed.title = `:repeat: ${video.title} **On Loop**`;
              message.guild.musicData.loopQueue = true;
            }
          } catch (error) {
            message.say(':x: Something went wrong' + error);
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
                embed.title = `:musical_note:  ${video.title}`;
              message.guild.musicData.loopSong = false;
            } else {
              for (const embed of instance.array)
                embed.title = `:repeat_one: ${video.title} **On Loop**`;
              message.guild.musicData.loopSong = true;
            }
          } catch (error) {
            message.say(':x: Something went wrong' + error);
            console.log(error);
          }
        }
      );
    videoEmbed.build();
    return;

    function stopPauseTimer() {
      clearTimeout(pauseTimer);
    }
    function startPauseTimer() {
      pauseTimer = setTimeout(() => {
        message.guild.musicData.songDispatcher.resume();
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.loopSong = false;
        setTimeout(() => {
          message.guild.musicData.songDispatcher.end();
        }, 100);
        message.say(`:zzz: Left channel due to inactivity.`);
        videoEmbed.setTimeout(0);
      }, 600000);
    }
  }

  static playbackBar(message, video) {
    const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
    const passedTimeInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
    };
    const passedTimeFormatted = NowPlayingCommand.formatDuration(
      passedTimeInMSObj
    );

    const totalDurationObj = video.rawDuration;
    const totalDurationFormatted = NowPlayingCommand.formatDuration(
      totalDurationObj
    );

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
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
