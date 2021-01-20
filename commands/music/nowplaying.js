const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

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

    const title = message.guild.musicData.loopSong
      ? `:repeat: ${video.title} **On Loop**`
      : video.title;

    var nowPlayingArr = [
      new MessageEmbed()
        .setThumbnail(video.thumbnail)
        .setColor('#e9f931')
        .setTitle(`:notes: ${title}`)
        .setURL(video.url)
        .setDescription(description)
        .addField(
          'Volume',
          ':loud_sound: ' +
            message.guild.musicData.songDispatcher.volume * 100 +
            '%',
          true
        )
    ];

    var videoEmbed = new Pagination.Embeds()
      .setArray(nowPlayingArr)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setTimeout(
        video.rawDuration - message.guild.musicData.songDispatcher.streamTime
      )
      .setDeleteOnTimeout(true)
      .setFunctionEmojis({
        // Exit
        '❌': _ => {
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
          message.say(`:grey_exclamation: Left the channel.`);
        },
        // Volume down
        '🔉': (_, instance) => {
          if (message.guild.musicData.songDispatcher.volume > 0.01) {
            for (const embed of instance.array)
              embed.fields[0].value =
                ':loud_sound: ' +
                (
                  (message.guild.musicData.songDispatcher.volume - 0.05) *
                  100
                ).toFixed(0) +
                '%';

            message.guild.musicData.songDispatcher.setVolume(
              message.guild.musicData.songDispatcher.volume - 0.05
            );
          }
        },
        // Volume up
        '🔊': (_, instance) => {
          if (message.guild.musicData.songDispatcher.volume < 2) {
            for (const embed of instance.array)
              embed.fields[0].value =
                ':loud_sound: ' +
                (
                  (message.guild.musicData.songDispatcher.volume + 0.05) *
                  100
                ).toFixed(0) +
                '%';

            message.guild.musicData.songDispatcher.setVolume(
              message.guild.musicData.songDispatcher.volume + 0.05
            );
          }
        },
        // Play/Pause
        '⏯️': (_, instance) => {
          if (message.guild.musicData.songDispatcher.paused == false) {
            for (const embed of instance.array)
              embed.title.name = `:pause_button: ${video.title}`;
            videoEmbed.setTimeout(600000);
            message.guild.musicData.songDispatcher.pause();
            // Leaves Channel if paused for 10 min
            setTimeout(() => {
              message.guild.musicData.songDispatcher.resume();
              message.guild.musicData.queue.length = 0;
              message.guild.musicData.loopSong = false;
              setTimeout(() => {
                message.guild.musicData.songDispatcher.end();
              }, 100);
              message.say(`:zzz: Left channel due to inactivity.`);
              videoEmbed.setTimeout(0);
            }, 600000);
          } else {
            for (const embed of instance.array)
              embed.title.name = `:notes: ${title}`;
            videoEmbed.setTimeout(
              video.rawDuration -
                message.guild.musicData.songDispatcher.streamTime
            );
            message.guild.musicData.songDispatcher.resume();
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
          [message.guild.musicData.queue.length - 1] + ' Song(s)',
          true
        )
        .addField(
          ':track_next: Next Song',
          `[${message.guild.musicData.queue[1].title}](${message.guild.musicData.queue[1].url})`
        )
        // Next track
        .addFunctionEmoji('⏭️', _ => {
          videoEmbed.setTimeout(100);
          message.guild.musicData.loopSong = false;
          message.guild.musicData.songDispatcher.end();
        })
        // Repeat Queue
        .addFunctionEmoji('🔁', _ => {
          if (message.guild.musicData.loopQueue) {
            for (const embed of instance.array)
              embed.title.name = `:notes: ${title}`;
            message.guild.musicData.loopQueue = false;
          } else {
            for (const embed of instance.array)
              embed.title.name = `:repeat: ${video.title} **On Loop**`;
            message.guild.musicData.loopQueue = true;
          }
        });
    }
    videoEmbed.addFunctionEmoji(
      // Repeat current song
      '🔂',
      _ => {
        for (const embed of instance.array)
          if (message.guild.musicData.loopSong) {
            embed.title.name = `:notes: ${title}`;
            message.guild.musicData.loopSong = false;
          } else {
            embed.title.name = `:repeat_one: ${video.title} **On Loop**`;
            message.guild.musicData.loopSong = true;
          }
      }
    );
    videoEmbed.build();
    return;
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
