const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const db = require('quick.db');
const { prefix } = require('../../config.json');

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
        }
      ]
    });
  }
  async run(message, { numberOfSongs }) {
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
    // fetch link array from txt file
    const jsonSongs = fs.readFileSync(
      '././resources/music/musictrivia.json',
      'utf8'
    );
    var videoDataArray = JSON.parse(jsonSongs).songs;
    // get random numberOfSongs videos from array
    const randomXVideoLinks = MusicTriviaCommand.getRandom(
      videoDataArray,
      numberOfSongs
    ); // get x random urls
    // create and send info embed
    const infoEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle(':notes: Starting Music Quiz!')
      .setDescription(
        `:notes: Get ready! There are ${numberOfSongs} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
        Vote skip the song by entering the word 'skip'.
        You can end the trivia at any point by using the ${prefix}end-trivia command!`
      );
    message.channel.send(infoEmbed);
    // init quiz queue
    // turn each vid to song object

    for (let i = 0; i < randomXVideoLinks.length; i++) {
      const song = {
        url: randomXVideoLinks[i].url,
        singer: randomXVideoLinks[i].singer,
        title: randomXVideoLinks[i].title,
        voiceChannel
      };
      message.guild.triviaData.triviaQueue.push(song);
    }
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
    const randomStartTime = Math.floor(Math.random() * (80 - 30 + 1)) + 30;
    var classThis = this;
    queue[0].voiceChannel.join().then(function(connection) {
      const dispatcher = connection
        .play(
          ytdl(queue[0].url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1024
          }),
          {
            seek: randomStartTime
          }
        )
        .on('error', async function(e) {
          message.reply(':x: Could not play that song!');
          console.log(e);
          if (queue.length > 1) {
            queue.shift();
            classThis.playQuizSong(queue, message);
            return;
          }
          const sortedScoreMap = new Map(
            [...message.guild.triviaData.triviaScore.entries()].sort(function(
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
        .on('start', function() {
          message.guild.musicData.songDispatcher = dispatcher;

          if (!db.get(`${message.guild.id}.serverSettings.volume`))
            dispatcher.setVolume(message.guild.musicData.volume);
          else
            dispatcher.setVolume(
              db.get(`${message.guild.id}.serverSettings.volume`)
            );

          let songNameFound = false;
          let songSingerFound = false;

          let skipCounter = 0;
          const skippedArray = [];

          const filter = msg =>
            message.guild.triviaData.triviaScore.has(msg.author.username);
          const collector = message.channel.createMessageCollector(filter, {
            time: 30000
          });

          collector.on('collect', msg => {
            if (!message.guild.triviaData.triviaScore.has(msg.author.username))
              return;
            if (msg.content.startsWith(prefix)) return;

            let guess = normalizeValue(msg.content);
            let title = normalizeValue(queue[0].title);
            let singer = normalizeValue(queue[0].singer);
            if (guess === 'skip') {
              if (skippedArray.includes(msg.author.username)) {
                return;
              }
              skippedArray.push(msg.author.username);
              skipCounter++;
              if (
                skipCounter >
                message.guild.triviaData.triviaScore.size * 0.6
              ) {
                return collector.stop();
              }
              return;
            }

            // if user guessed both
            if (guess.includes(singer) && guess.includes(title)) {
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
            }
            // if user guessed singer
            else if (guess.includes(singer)) {
              if (songSingerFound) return; // if singer has already been found
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
            }
            // if user guessed song name
            else if (guess.includes(title)) {
              if (songNameFound) return; // if song name has already been found
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
            } else {
              // wrong answer
              return msg.react('❌');
            }
          });

          collector.on('end', function() {
            /*
            The reason for this if statement is that we don't want to get an
            empty embed returned via chat by the bot if end-trivia command was called
            */
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.triviaData.wasTriviaEndCalled = false;
              return;
            }

            const sortedScoreMap = new Map(
              [...message.guild.triviaData.triviaScore.entries()].sort(function(
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
            dispatcher.end();
            return;
          });
        })
        .on('finish', function() {
          if (queue.length >= 1) {
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
              [...message.guild.triviaData.triviaScore.entries()].sort(function(
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
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
};

var normalizeValue = value =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^0-9a-zA-Z\s]/g, '') // remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase(); // remove duplicate spaces
