const Discord = require("discord.js");
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const { prefix, spotify_secret, spotify_clientid } = require('../../config.json');
const Spotify = require("spotify-api.js")
const sp_client = new Spotify.Client();
const MAX_DISTANCE = 3;
const REGEX_PARENTHESES = /\(.*\)/;
const REGEX_DASH = /-.*/;
const REGEX_SPECIAL_CHARACTERS = /[^0-9a-zA-Z\s]+/;

module.exports = class MusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'music-trivia',
      memberName: 'music-trivia',
      aliases: ['music-quiz', 'start-quiz', 'mtrivia'],
      group: 'music',
      description: 'Engage in a music quiz with your friends!',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 1,
        duration: 10
      },
      args: [
        {
          key: 'numberOfSongs',
          prompt: 'What is the number of songs you want the quiz to have?',
          type: 'integer',
          min: 1,
          //default: 5,
          max: 15
        },
        {
          key: 'playlist',
          prompt: 'Which playlist to choose from',
          type: 'string'
        }
      ]
    });
  }
  async run(message, { numberOfSongs, playlist }) {
    // check if user is in a voice channel
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(':no_entry: Please join a voice channel and try again!');
      return;
    }
    if (message.guild.musicData.isPlaying === true)
      return message.channel.send(':x: A quiz or a song is already running!');
    message.guild.musicData.isPlaying = true;
    message.guild.triviaData.isTriviaRunning = true;
    message.guild.triviaData.triviaQueue = [];


    // const token = await Auth.get({
    //   clientId: spotify_clientid,
    //   clientSecret: spotify_secret,
    // });
    await sp_client.login(spotify_clientid, spotify_secret);
    const regexp = /\/playlist\/(.+)\?/;
    playlist = playlist.match(regexp)[1];
    if (!playlist) {
      message.reply('Invalid playlist!');
      return;
    }
    const sp_playlist = await sp_client.playlists.get(playlist);
    const tracks = await (await sp_playlist.getTracks()).items;
    const infoEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle(':notes: Starting Music Quiz!')
      .setDescription(
        `:notes: Get ready! There are ${numberOfSongs} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
        You can end the trivia at any point by using the ${prefix}end-trivia command!`
      );
    message.channel.send(infoEmbed);
    var songMap = new Map();
    for (let i = 0; i < numberOfSongs; i++) {
      var track = tracks[Math.floor(Math.random() * tracks.length)].track;
      if (songMap.has(track.id)) {
        i--;
        continue;
      }
      if (!track.previewUrl || !track.artists[0].name || !track.name) {
        i--;
        //console.log("Not adding: " + track.name);
        continue;
      }
      const song = {
        url: track.previewUrl,
        singer: track.artists[0].name,
        title: track.name,
        voiceChannel
      };

      console.log(song.singer + ": " + song.title);
      songMap.set(track.id, song);

    }
    message.guild.triviaData.triviaQueue = Array.from(songMap.values());
    const channelInfo = Array.from(
      message.member.voice.channel.members.entries()
    );
    channelInfo.forEach(user => {
      if (user[1].user.bot) return;
      message.guild.triviaData.triviaScore.set(user[1].user.username, 0);
    });
    MusicTriviaCommand.playQuizSong(
      message.guild.triviaData.triviaQueue,
      message
    );
  }
  static async playQuizSong(queue, message) {
    var classThis = this;
    message.member.voice.channel.join().then(function (connection) {
      //console.log("playQuizSongStart:\n\n");
      //queue.forEach(element => console.log(element.singer + ":" + element.title + ":" + element.url));
      const dispatcher = connection
        .play(queue[0].url)
        .on('start', function () {
          console.log("Playing: " + queue[0].singer + ": " + queue[0].title + " " + queue[0].url);
          message.guild.musicData.songDispatcher = dispatcher;
          if (!db.get(`${message.guild.id}.serverSettings.volume`))
            dispatcher.setVolume(message.guild.musicData.volume);
          else
            dispatcher.setVolume(
              db.get(`${message.guild.id}.serverSettings.volume`)
            );

          let songNameFound = false;
          let songSingerFound = false;

          const filter = msg =>
            message.guild.triviaData.triviaScore.has(msg.author.username);
          const collector = message.channel.createMessageCollector(filter, {
            time: 28000
          });

          var trackTitle = queue[0].title
            .split('feat.')[0]
            .split('ft.')[0]
            .toLowerCase()
            .replace(REGEX_DASH, "")
            .replace(REGEX_PARENTHESES, "")
            .replace(REGEX_SPECIAL_CHARACTERS, "")
            .trim();

          var trackArtist = queue[0].singer.toLowerCase().replace().replace(REGEX_SPECIAL_CHARACTERS, "");


          collector.on('collect', msg => {
            if (!message.guild.triviaData.triviaScore.has(msg.author.username))
              return;
            if (msg.content.startsWith(prefix)) return;
            var userInput = msg.content.toLowerCase()
              .replace(REGEX_DASH)
              .replace(REGEX_PARENTHESES)
              .replace(REGEX_SPECIAL_CHARACTERS, "")
              .trim();

            // if user guessed song name
            if (userInput === trackTitle || MusicTriviaCommand.levenshtein(userInput, trackTitle) <= MAX_DISTANCE) {
              if (songNameFound) return; // if song name already found
              songNameFound = true;

              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.set(
                  msg.author.username,
                  message.guild.triviaData.triviaScore.get(
                    msg.author.username
                  ) + 1
                );
                msg.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.set(
                msg.author.username,
                message.guild.triviaData.triviaScore.get(msg.author.username) +
                1
              );
              msg.react('☑');
            }
            // if user guessed singer
            else if (
              userInput === trackArtist || MusicTriviaCommand.levenshtein(userInput, trackTitle) <= MAX_DISTANCE
            ) {
              if (songSingerFound) return;
              songSingerFound = true;
              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.set(
                  msg.author.username,
                  message.guild.triviaData.triviaScore.get(
                    msg.author.username
                  ) + 1
                );
                msg.react('☑');
                return collector.stop();
              }

              message.guild.triviaData.triviaScore.set(
                msg.author.username,
                message.guild.triviaData.triviaScore.get(msg.author.username) +
                1
              );
              msg.react('☑');
            } else if (MusicTriviaCommand.levenshtein(userInput, trackArtist + ' ' + trackTitle) <= MAX_DISTANCE
              ||
              MusicTriviaCommand.levenshtein(userInput, trackTitle + ' ' + trackArtist) <= MAX_DISTANCE
            ) {
              if (
                (songSingerFound && !songNameFound) ||
                (songNameFound && !songSingerFound)
              ) {
                message.guild.triviaData.triviaScore.set(
                  msg.author.username,
                  message.guild.triviaData.triviaScore.get(
                    msg.author.username
                  ) + 1
                );
                msg.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.set(
                msg.author.username,
                message.guild.triviaData.triviaScore.get(msg.author.username) +
                2
              );
              msg.react('☑');
              return collector.stop();
            } else {
              // wrong answer
              return msg.react('❌');
            }
          });
          collector.on('end', function () {
            /*
            The reason for this if statement is that we don't want to get an
            empty embed returned via chat by the bot if end-trivia command was called
            */
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.triviaData.wasTriviaEndCalled = false;
              return;
            }

            const sortedScoreMap = new Map(
              [...message.guild.triviaData.triviaScore.entries()].sort(function (
                a,
                b
              ) {
                return b[1] - a[1];
              })
            );

            const song = `${classThis.capitalize_Words(
              queue[0].singer
            )}: ${classThis.capitalize_Words(queue[0].title)}`;

            const embed = new MessageEmbed()
              .setColor('#ff7373')
              .setTitle(`:musical_note: The song was:  ${song}`)
              .setDescription(
                classThis.getLeaderBoard(Array.from(sortedScoreMap.entries()))
              );

            message.channel.send(embed);
            queue.shift();
            console.log("Shift in Collector:End");
            dispatcher.end();
            return;
          });
        })
        .on('error', async function (e) {
          message.reply(':x: Could not play that song!');
          console.log(e);
          if (queue.length > 1) {
            queue.shift();
            console.log("Shift in Error");
            classThis.playQuizSong(queue, message);
            return;
          }
          const sortedScoreMap = new Map(
            [...message.guild.triviaData.triviaScore.entries()].sort(function (
              a,
              b
            ) {
              return b[1] - a[1];
            })
          );
          const embed = new MessageEmbed()
            .setColor('#ff7373')
            .setTitle(`Music Quiz Results:`)
            .setDescription(
              classThis.getLeaderBoard(Array.from(sortedScoreMap.entries()))
            );
          message.channel.send(embed);
          message.guild.musicData.isPlaying = false;
          message.guild.triviaData.isTriviaRunning = false;
          message.guild.triviaData.triviaScore.clear();
          message.guild.musicData.songDispatcher = null;
          message.guild.me.voice.channel.leave();
          return;
        })
        .on('finish', function () {
          if (queue.length >= 1) {
            //console.log("playQuizSongFinish:\n\n");
            //queue.forEach(element => console.log(element.singer + ":" + element.title + ":" + element.url));
            return classThis.playQuizSong(queue, message);
          } else {
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.musicData.isPlaying = false;
              message.guild.triviaData.isTriviaRunning = false;
              message.guild.musicData.songDispatcher = null;
              message.guild.me.voice.channel.leave();
              return;
            }
            const sortedScoreMap = new Map(
              [...message.guild.triviaData.triviaScore.entries()].sort(function (
                a,
                b
              ) {
                return b[1] - a[1];
              })
            );
            const embed = new MessageEmbed()
              .setColor('#ff7373')
              .setTitle(`Music Quiz Results:`)
              .setDescription(
                classThis.getLeaderBoard(Array.from(sortedScoreMap.entries()))
              );
            message.channel.send(embed);
            message.guild.musicData.isPlaying = false;
            message.guild.triviaData.isTriviaRunning = false;
            message.guild.triviaData.triviaScore.clear();
            message.guild.musicData.songDispatcher = null;
            message.guild.me.voice.channel.leave();
            return;
          }
        });
    });
  }

  static getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available!');
    while (n--) {
      var x = Math.floor(Math.random() * len);
      // prettier-ignore
      result[n] = arr[(x in taken) ? taken[x] : x];
      // prettier-ignore
      taken[x] = (--len in taken) ? taken[len] : len;
      // prettier-ignore-end
    }
    return result;
  }

  static getLeaderBoard(arr) {
    if (!arr) return;
    if (!arr[0]) return; // issue #422
    let leaderBoard = '';

    leaderBoard = `👑   **${arr[0][0]}:** ${arr[0][1]}  points`;

    if (arr.length > 1) {
      for (let i = 1; i < arr.length; i++) {
        leaderBoard =
          leaderBoard + `\n\n   ${i + 1}: ${arr[i][0]}: ${arr[i][1]}  points`;
      }
    }
    return leaderBoard;
  }
  // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-9.php
  static capitalize_Words(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  static levenshtein(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    return track[str2.length][str1.length];
  }
};
