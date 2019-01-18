const playFile = require("./play.js");

module.exports = {
  name: "pause",
  cooldown: 2,
  description: "Pauses the current playing song if one is playing",
  execute(message) {
    if (!message.guild) return;
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Join a channel and try again");

    const dispatcher = playFile.dispatcher;

    if (typeof dispatcher == "undefined") {
      return message.reply("There is no song playing right now!");
    }

    dispatcher.pause();
  }
};
