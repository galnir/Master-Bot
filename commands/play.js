const Discord = require('discord.js');
const client = new Discord.Client();
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const {
  youtubeAPI
} = require('../config.json');
const youtube = new Youtube(youtubeAPI);


module.exports = {
  name: "play",
  cooldown: 5,
  description: "Plays selected music from youtube",
  async execute(message, args) {

    // * inital checking if client is in a channel and if bot is in one too

    if (!message.guild) return;
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    // * end inital check

    // * if user entered full youtube url
    if (!args) return message.reply('Please provide a song name, url or id');
    const query = args.join(' ');
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {

      playSong(query);
    } else {
      // console.log(message.guild.id) // ignore this log 
      // * end case 1

      try {
        var videos = await youtube.searchVideos(query, 5);
        let vidNameArr = [];
        let j = 1;
        for (let i = 0; i < videos.length; i++) {
          //console.log(videos[i].title);
          vidNameArr.push(`${j}: ${videos[i].title}`);
          j++

        }
        vidNameArr.push('exit');
        const embed = new Discord.MessageEmbed()
          .setColor('#e9f931')
          .addField(vidNameArr)
        message.channel.send({
          embed
        });

      } catch (error) {
        console.error(error);
        return message.channel.send('Something went wrong when searching the video you requested');
      }

      try {
        var response = await message.channel.awaitMessages(msg => msg.content > 0 && msg.content < 6, {
          maxMatches: 1,
          time: 10000,
          errors: ['time']
        });
      } catch (error) {
        console.error(error);
        return message.channel.send('Please try again and enter a number between 1-5 or exit');
      }

      const videoIndex = parseInt(response.first().content);
      var proccessedURL;
      try {
        const video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        // console.log(video.raw.id);  W9P_qUnMaFg
        proccessedURL = `https://www.youtube.com/watch?v=${video.raw.id}`;
      } catch (error) {
        console.error(error);
        return message.channel.send('An error has occured when trying to get the video ID from youtube')
      }
      playSong(proccessedURL);

    }



    function playSong(url) {
      voiceChannel.join()
        .then(connection => {
          const dispatcher = connection.play(ytdl(
              url, {
                filter: 'audioonly',
                volume: 1,
                passes: 3
              }))
            .on('finish', () => {
              message.channel.send('song ended');
            })
            .on('error', e => {
              console.log(e);
            });
        })
        .catch(err => {
          console.log(err);
        })
    }
  }
};