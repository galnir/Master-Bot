module.exports = {
  name: "whomademe",
  cooldown: 5,
  description: "Description about the bot maker",
  execute(message) {
    message.channel.send("Made by @hyperzone with :heart:");
  }
};
