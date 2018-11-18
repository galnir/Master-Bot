module.exports = {
  name: "who-made-me",
  cooldown: 5,
  description: "Who is the developer",
  execute(message) {
    message.channel.send(
      "Made by @hyperzone#1185 with :heart: see repo here https://github.com/galnir/discordBot"
    );
  }
};
