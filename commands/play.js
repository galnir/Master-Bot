const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
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
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    // * end inital check

    // * sanitize and transform input(ytdl needs to recieve a string as an argument)
    if (!args) return message.reply('Please provide a song name, url or id');
    const joinedArg = args.join(' ');
    if (joinedArg.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      playSong(joinedArg);
    }

    const searchQuery = joinedArg;
    // console.log(message.guild.id) => 336505000828076032 
    searchVideoAndDisplay(searchQuery);





    // * end sanitizing






    // function section

    async function searchVideoAndDisplay(query) {
      try {
        const videos = await youtube.searchVideos(query, 5);
        let vidNameArr = [];

        let j = 1;
        for (let i = 0; i < videos.length; i++) {
          //console.log(videos[i].title);
          vidNameArr.push(`${j}: ${videos[i].title}`);
          j++

        }
        vidNameArr.push('exit');
        const embed = new Discord.RichEmbed()
          .setColor('#e9f931')
          .addField(vidNameArr)
        message.channel.send({
          embed
        });

      } catch (error) {
        console.error(error);
        message.channel.send('Something went wrong when searching the video you requested');
      }
    }


    function playSong(url) {
      const dispatcher = connection.playStream(ytdl(url))
        .on('end', () => {
          message.channel.send('song ended');
        })
        .on('error', e => {
          console.log(e);
        });
    }

  }
};