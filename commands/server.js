module.exports = {
  name: "server",
  cooldown: 5,
  description: "gives server information!",
  execute(message) {
    message.channel.send(
      `Server name: ${message.guild.name}\nTotal members: ${
        message.guild.memberCount
      }`
    );
  }
};
