const Discord = require("discord.js");
const Youtube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const { youtubeAPI } = require("../config.json");
const youtube = new Youtube(youtubeAPI);

module.exports = {
  name: "play",
  cooldown: 5,
  description: "Plays selected music from youtube",
  async execute(message, args) {
    // initial checking
    if (!message.guild) return;
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      // ^ only for testing will be removed when the music bot is complete
      return message.channel.send("No permission!");
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Join a channel and try again");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) {
      return message.channel.send(
        `I don't have permission to connect to your voice channel`
      );
    }
    if (!permissions.has("SPEAK")) {
      return message.channel.send(`I don't have permission to speak`);
    }
    if (!args) {
      return message.reply("Please provide a song name or a full url");
    }
    // end initial check

    let query = args.join(" ");
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      let id;
      let vidTitle;
      let url = query;
      try {
        query = query
          .replace(/(>|<)/gi, "")
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        id = query[2].split(/[^0-9a-z_\-]/i);
        id = id[0];
        let video = await youtube.getVideoByID(id);
        vidTitle = video.title;
      } catch {
        return message.channel.send("Something went wrong, please try later");
      }

      return playSong(url, voiceChannel, message, vidTitle);
    }

    try {
      var videos = await youtube.searchVideos(query, 5);
      let vidNameArr = [];
      let j = 1;
      for (let i = 0; i < videos.length; i++) {
        vidNameArr.push(`${j}: ${videos[i].title}`);
        j++;
      }
      vidNameArr.push("exit");
      const embed = new Discord.MessageEmbed()
        .setColor("#e9f931")
        .setTitle("Choose a song by commenting a number between 1 and 5")
        .addField("Song 1", vidNameArr[0])
        .addField("Song 2", vidNameArr[1])
        .addField("Song 3", vidNameArr[2])
        .addField("Song 4", vidNameArr[3])
        .addField("Song 5", vidNameArr[4])
        .addField("Exit", "exit");
      var songEmbed = await message.channel.send({ embed });
      try {
        var response = await message.channel.awaitMessages(
          (msg => msg.content > 0 && msg.content < 6) || msg.content === "exit",
          {
            max: 1,
            maxProcessed: 1,
            time: 60000,
            errors: ["time"]
          }
        );
      } catch {
        console.error(error);
        deleteEmbed(songEmbed);
        return message.channel.send(
          "Please try again and enter a number between 1 and 5 or exit"
        );
      }
      if (response.first().content === "exit") return;
      const videoIndex = parseInt(response.first().content);
      try {
        var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
      } catch {
        deleteEmbed(songEmbed);
        return message.channel.send(
          "An error has occured when trying to get the video ID from youtube"
        );
      }
      const proccessedURL = `https://www.youtube.com/watch?v=${video.raw.id}`;
      var vidTitle = video.title;
      deleteEmbed(songEmbed);
      playSong(proccessedURL, voiceChannel, message, vidTitle);
    } catch {
      if (songEmbed) {
        deleteEmbed(songEmbed);
      }
      return message.channel.send(
        "Something went wrong with searching the video you requested :("
      );
    }
  }
};

function playSong(url, voiceChannel, message, videoTitle) {
  voiceChannel
    .join()
    .then(connection => {
      const dispatcher = connection
        .play(
          ytdl(url, {
            volume: 1,
            quality: "highestaudio",
            highWaterMark: 1024 * 1024 * 10
          })
        )
        .on("start", () => {
          module.exports.dispatcher = dispatcher;
          return message.channel.send(
            `:musical_note: Now playing: ${videoTitle} :musical_note:`
          );
        })
        .on("finish", () => {
          return message.channel.send("song ended"); // only here for testing
        })
        //.on("speaking", value => {})
        .on("error", e => {
          return console.log(e);
        });
    })
    .catch(err => {
      return console.log(err);
    });
}

function deleteEmbed(embed) {
  try {
    embed.delete();
  } catch (error) {
    console.error(error);
  }
}
