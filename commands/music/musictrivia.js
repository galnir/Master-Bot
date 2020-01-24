const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');

module.exports = class MusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'music-trivia',
      memberName: 'music-trivia',
      group: 'music',
      description: "Engage in a 2000's music quiz with your friends!",
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }
  async run(message) {
    // check if user is in a voice channel
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.say('Please join a voice channel and try again');
    if (message.guild.musicData.isPlaying === true)
      return message.channel.send('A trivia or a song is already running');
    message.guild.musicData.isPlaying = true;
    message.guild.triviaData.isTriviaRunning = true;
    // fetch link array from txt file
    const jsonSongs = fs.readFileSync(
      'resources/music/musictrivia.json',
      'utf8'
    );
    var videoDataArray = JSON.parse(jsonSongs).songs;
    // get random x videos from array
    const numOfLinks = 5;
    const randomXVideoLinks = this.getRandom(videoDataArray, numOfLinks); // get x random urls
    // create and send info embed
    const infoEmbed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle('Starting Music Quiz')
      .setDescription(
        `Get ready! There are ${numOfLinks} songs, you have 30 seconds to guess either the singer/band or the name of the song. Good luck!`
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
      message.guild.triviaData.triviaScore.set(user[1].user.username, {
        score: 0
      });
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
            if (m.content.toLowerCase() === queue[0].title) {
              if (songNameFound) return; // if song name already found
              songNameFound = true;

              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.get(m.author.username)
                  .score++;
                m.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.get(m.author.username)
                .score++;
              m.react('☑');
            }
            // if user guessed singer
            else if (m.content.toLowerCase() === queue[0].singer) {
              if (songSingerFound) return;
              songSingerFound = true;
              if (songNameFound && songSingerFound) {
                message.guild.triviaData.triviaScore.get(m.author.username)
                  .score++;
                m.react('☑');
                return collector.stop();
              }

              message.guild.triviaData.triviaScore.get(m.author.username)
                .score++;
              m.react('☑');
            } else if (
              m.content.toLowerCase() ===
                queue[0].singer + ' ' + queue[0].title ||
              m.content.toLowerCase() === queue[0].title + ' ' + queue[0].singer
            ) {
              if (
                (songSingerFound && !songNameFound) ||
                (songNameFound && !songSingerFound)
              ) {
                message.guild.triviaData.triviaScore.get(m.author.username)
                  .score++;
                m.react('☑');
                return collector.stop();
              }
              message.guild.triviaData.triviaScore.get(
                m.author.username
              ).score =
                message.guild.triviaData.triviaScore.get(m.author.username)
                  .score + 2;
              m.react('☑');
              return collector.stop();
            } else {
              // wrong answer
              return m.react('❌');
            }
          });

          collector.on('end', () => {
            console.log(
              Array.from(message.guild.triviaData.triviaScore.entries())
            );
            message.channel.send(
              this.scoreEmbed(
                Array.from(message.guild.triviaData.triviaScore.entries())
              )
            );
            queue.shift();
            dispatcher.end();
            return;
          });
        })
        .on('end', () => {
          if (queue.length >= 1) {
            return this.playQuizSong(queue, message);
          } else {
            if (message.guild.triviaData.wasTriviaEndCalled) {
              message.guild.musicData.isPlaying = false;
              message.guild.triviaData.isTriviaRunning = false;
              message.guild.triviaData.wasTriviaEndCalled = false;
              message.guild.triviaData.triviaScore.clear();
              message.guild.me.voice.channel.leave();
              return;
            }
            let highestTriviaScore = 0;
            let winner = '';
            let isHighestValueDuplicate = false;

            Array.from(message.guild.triviaData.triviaScore.entries()).map(
              entry => {
                if (entry[1].score > highestTriviaScore) {
                  highestTriviaScore = entry[1].score;
                  winner = entry[0];
                  isHighestValueDuplicate = false;
                } else if (entry[1].score == highestTriviaScore) {
                  isHighestValueDuplicate = true;
                }
              }
            );
            if (highestTriviaScore == 0 || isHighestValueDuplicate) {
              message.guild.musicData.isPlaying = false;
              message.guild.triviaData.isTriviaRunning = false;
              message.guild.triviaData.triviaScore.clear();
              message.guild.me.voice.channel.leave();
              return message.channel.send('No one won. Better luck next time');
            } else {
              message.channel.send(
                `The winner is ${winner} with ${highestTriviaScore} points`
              );
              message.guild.musicData.isPlaying = false;
              message.guild.triviaData.isTriviaRunning = false;
              message.guild.triviaData.triviaScore.clear();
              message.guild.me.voice.channel.leave();
              return;
            }
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

  scoreEmbed(arr) {
    if (!arr) return;

    // create an embed with no fields
    const embed = new MessageEmbed()
      .setColor('#ff7373')
      .setTitle('Trivia Score');

    for (let i = 0; i < arr.length; i++) {
      embed.addField(arr[i][0] + ':', arr[i][1].score);
    }

    return embed;
  }
};
