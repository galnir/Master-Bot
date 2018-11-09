module.exports = {
  name: "ping",
  cooldown: 5,
  description: "Ping!",
  execute(message) {
    message.channel.send("Pong.");
  }
};
