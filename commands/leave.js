
module.exports = {
  name: "leave",
  cooldown: 5,
  description: `makes the bot leave the voice channel he's in`,
  execute(message) {
    if (message.guild.voiceConnection) {
      return message.guild.voiceConnection.disconnect();
    } else {
      return message.reply(`I'm not in a channel right now`);
    }
  }
};