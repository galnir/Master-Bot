const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

var queue = [];
var isPlaying;

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['play-song', 'add'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song from youtube',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'text',
          prompt: 'What song would you like to listen to?',
          type: 'string',
          validate: text => text.length > 0 && text.length < 200
        }
      ]
    });
  }

  async run(message, { text }) {
    // initial checking
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.say('Join a channel and try again');
    // end initial check

    let query = text;
    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      const url = query;
      try {
        query = query
          .replace(/(>|<)/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        const id = query[2].split(/[^0-9a-z_\-]/i)[0];
        const video = await youtube.getVideoByID(id);
        if (video.raw.snippet.liveBroadcastContent === 'live')
          return message.say("I don't support live streams!");
        const title = video.title;

        const song = {
          url,
          title,
          voiceChannel
        };
        if (queue.length > 6) {
          return message.say(
            'There are too many songs in the queue already, skip or wait a bit'
          );
        }
        queue.push(song);
        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          return playSong(queue, message);
        } else if (isPlaying == true) {
          return message.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        return message.say('Something went wrong, please try later');
      }
    }
    try {
      const videos = await youtube.searchVideos(query, 5);
      const vidNameArr = [];
      let j = 1;
      for (let i = 0; i < videos.length; i++) {
        vidNameArr.push(`${j}: ${videos[i].title}`);
        j++;
      }
      vidNameArr.push('exit');
      const embed = new MessageEmbed()
        .setColor('#e9f931')
        .setTitle('Choose a song by commenting a number between 1 and 5')
        .addField('Song 1', vidNameArr[0])
        .addField('Song 2', vidNameArr[1])
        .addField('Song 3', vidNameArr[2])
        .addField('Song 4', vidNameArr[3])
        .addField('Song 5', vidNameArr[4])
        .addField('Exit', 'exit');
      var songEmbed = await message.say({ embed });
      try {
        var response = await message.channel.awaitMessages(
          msg => (msg.content > 0 && msg.content < 6) || msg.content === 'exit',
          {
            max: 1,
            maxProcessed: 1,
            time: 60000,
            errors: ['time']
          }
        );
      } catch (err) {
        console.error(err);
        deleteEmbed(songEmbed);
        return message.say(
          'Please try again and enter a number between 1 and 5 or exit'
        );
      }
      if (response.first().content === 'exit') return deleteEmbed(songEmbed);
      const videoIndex = parseInt(response.first().content);
      try {
        var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        if (video.raw.snippet.liveBroadcastContent === 'live')
          return message.say("I don't support live streams!");
      } catch (err) {
        console.error(err);
        deleteEmbed(songEmbed);
        return message.say(
          'An error has occured when trying to get the video ID from youtube'
        );
      }
      const url = `https://www.youtube.com/watch?v=${video.raw.id}`;
      const title = video.title;

      try {
        let song = {
          url,
          title,
          voiceChannel
        };
        if (queue.length > 6) {
          return message.say(
            'There are too many songs in the queue already, skip or wait a bit'
          );
        }
        queue.push(song);
        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          deleteEmbed(songEmbed);
          playSong(queue, message);
        } else if (isPlaying == true) {
          deleteEmbed(songEmbed);
          return message.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        deleteEmbed(songEmbed);
        return message.say('queue process gone wrong');
      }
    } catch (err) {
      console.error(err);
      if (songEmbed) {
        deleteEmbed(songEmbed);
      }
      return message.say(
        'Something went wrong with searching the video you requested :('
      );
    }
  }
};

function playSong(queue, message) {
  let voiceChannel;
  queue[0].voiceChannel
    .join()
    .then(connection => {
      const dispatcher = connection
        .play(
          ytdl(queue[0].url, {
            volume: 0.5,
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10
          })
        )
        .on('start', () => {
          module.exports.dispatcher = dispatcher;
          module.exports.queue = queue;
          voiceChannel = queue[0].voiceChannel;
          return message.say(
            `:musical_note: Now playing: ${queue[0].title} :musical_note:`
          );
        })
        .on('finish', () => {
          queue.shift();
          if (queue.length >= 1) {
            return playSong(queue, message);
          } else {
            isPlaying = false;
            return voiceChannel.leave();
          }
        })
        .on('error', e => {
          message.say('Cannot play song');
          return console.log(e);
        });
    })
    .catch(err => {
      return console.log(err);
    });
}

function deleteEmbed(embed) {
  try {
    return embed.delete();
  } catch (err) {
    return console.error(err);
  }
}
