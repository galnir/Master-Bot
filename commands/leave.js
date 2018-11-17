const playFile = require("./play.js");

module.exports = {
  name: "leave",
  cooldown: 5,
  description: `makes the bot leave the voice channel he's in`,
  execute(message) {
    if (!message.guild) return;
    const dispatcher = playFile.dispatcher;
    if (!message.guild.voiceConnection) {
      return message.reply("I'm not in a voice channel right now");
    } else if (message.guild.voiceConnection) {
      dispatcher.end();
      return message.guild.voiceConnection.disconnect();
    }
  }
};
