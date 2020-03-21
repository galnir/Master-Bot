const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = class MusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'music-trivia',
      memberName: 'music-trivia',
      aliases: ['music-quiz', 'start-quiz'],
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
          default: 5,
          max: 15
        }
      ]
    });
  }
  async run(message, { numberOfSongs }) {
    // check if user is in a voice channel
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.say('Please join a voice channel and try again');
    if (message.guild.musicData.isPlaying === true)
      return message.channel.send('A quiz or a song is already running');
    message.guild.musicData.isPlaying = true;
    message.guild.triviaData.isTriviaRunning = true;
    // fetch link array from txt file
    const jsonSongs = fs.readFileSync(
      'resources/music/musictrivia.json',
      'utf8'
    );
    var videoDataArray = JSON.parse(jsonSongs).songs;
    // get random numberOfSongs videos from array
    const randomXVideoLinks = this.getRandom(videoDataArray, numberOfSongs); // get x random urls
    // create and send info embed
    const infoEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle('Starting Music Quiz')
      .setDescription(
        `Get ready! There are ${numberOfSongs} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!
        You can end the trivia at any point by using the end-trivia command`
      );
    message.say(infoEmbed);
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
    this.playQuizSong(message.guild.triviaData.triviaQueue, message);
  }

  playQuizSong(queue, message) {
    queue[0].voiceChannel.join().then(connection => {
      const dispatcher = connection
        .play(
          ytdl(queue[0].url, {
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 1024
          })
        )
        .on('start', () => {
          message.guild.musicData.songDispatcher = dispatcher;
          dispatcher.setVolume(message.guild.musicData.volume);
          let songNameFound = false;
          let songSingerFound = false;

          const filter = m =>
            message.guild.triviaData.triviaScore.has(m.author.username);
          const collector = message.channel.createMessageCollector(filter, {
            time: 30000
          });

          collector.on('collect', m => {
            if (!message.guild.triviaData.triviaScore.has(m.author.username))
              return;
            if (m.content.startsWith(this.client.commandPrefix)) return;
            // if user guessed song name
            if (m.content.toLowerCase() === queue[0].title.toLowerCase()) {
              if (songNameFound) return; // if song name already found
              songNameFound = true;

              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.set(
                  m.author.username,
                  message.guild.triviaData.triviaScore.get(m.author.username) +
                    1
                );
                m.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.set(
                m.author.username,
                message.guild.triviaData.triviaScore.get(m.author.username) + 1
              );
              m.react('☑');
            }
            // if user guessed singer
            else if (
              m.content.toLowerCase() === queue[0].singer.toLowerCase()
            ) {
              if (songSingerFound) return;
              songSingerFound = true;
              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.set(
                  m.author.username,
                  message.guild.triviaData.triviaScore.get(m.author.username) +
                    1
                );
                m.react('☑');
                return collector.stop();
              }

              message.guild.triviaData.triviaScore.set(
                m.author.username,
                message.guild.triviaData.triviaScore.get(m.author.username) + 1
              );
              m.react('☑');
            } else if (
              m.content.toLowerCase() ===
                queue[0].singer.toLowerCase() +
                  ' ' +
                  queue[0].title.toLowerCase() ||
              m.content.toLowerCase() ===
                queue[0].title.toLowerCase() +
                  ' ' +
                  queue[0].singer.toLowerCase()
            ) {
              if (
                (songSingerFound && !songNameFound) ||
                (songNameFound && !songSingerFound)
              ) {
                message.guild.triviaData.triviaScore.set(
                  m.author.username,
                  message.guild.triviaData.triviaScore.get(m.author.username) +
                    1
                );
                m.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.set(
                m.author.username,
                message.guild.triviaData.triviaScore.get(m.author.username) + 2
              );
              m.react('☑');
              return collector.stop();
            } else {
              // wrong answer
              return m.react('❌');
            }
          });

          collector.on('end', () => {
            /*
            The reason for this if statement is that we don't want to get an
            empty embed returned via chat by the bot if end-trivia command was called
            */
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.triviaData.wasTriviaEndCalled = false;
              return;
            }

            const sortedScoreMap = new Map(
              [...message.guild.triviaData.triviaScore.entries()].sort(
                (a, b) => b[1] - a[1]
              )
            );

            const song = `${this.capitalize_Words(
              queue[0].singer
            )}: ${this.capitalize_Words(queue[0].title)}`;

            const embed = new MessageEmbed()
              .setColor('#ff7373')
              .setTitle(`The song was:  ${song}`)
              .setDescription(
                this.getLeaderBoard(Array.from(sortedScoreMap.entries()))
              );

            message.channel.send(embed);
            queue.shift();
            dispatcher.end();
            return;
          });
        })
        .on('finish', () => {
          if (queue.length >= 1) {
            return this.playQuizSong(queue, message);
          } else {
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.musicData.isPlaying = false;
              message.guild.triviaData.isTriviaRunning = false;
              message.guild.me.voice.channel.leave();
              return;
            }
            const embed = new MessageEmbed()
              .setColor('#ff7373')
              .setTitle(`Music Quiz Results:`)
              .setDescription(
                this.getLeaderBoard(
                  Array.from(message.guild.triviaData.triviaScore.entries())
                )
              );
            message.channel.send(embed);
            message.guild.musicData.isPlaying = false;
            message.guild.triviaData.isTriviaRunning = false;
            message.guild.triviaData.triviaScore.clear();
            message.guild.me.voice.channel.leave();
            return;
          }
        });
    });
  }

  getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  getLeaderBoard(arr) {
    if (!arr) return;
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
  capitalize_Words(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
};
