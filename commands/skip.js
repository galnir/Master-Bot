const playFile = require("./play.js");

module.exports = {
  name: "skip",
  cooldown: 2,
  description: "Skips the currently playing song, if one is playing",
  execute(message) {
    if (!message.guild) return;
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Join a channel and try again");

    var dispatcher = playFile.dispatcher;

    if (typeof dispatcher == "undefined") {
      return message.reply("There is no song playing right now!");
    }
    var queue = playFile.queue;
    if (queue >= 1) {
      queue.shift();
      return playFile.playSong(queue, message);
    } else {
      dispatcher.end();
    }
  }
};
