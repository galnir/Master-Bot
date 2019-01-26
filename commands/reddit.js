const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "test",
  cooldown: 0,
  description:
    "Get the 5 top posts for any subreddit you request or leave blank to get top posts for r/all",
  async execute(message, args) {
    console.log(args);
    try {
      if (!args) {
        await fetch("https://www.reddit.com/r/all/top/.json?limit=5&t=day")
          .then(res => res.json())
          .then(json => {
            const dataArr = json.data.children;
            for (let i = 0; i < dataArr.length; i++) {
              message.channel.send(embedPost(dataArr[i].data));
            }
          });
      } else {
        await fetch(`https://www.reddit.com/r/${args}/top/.json?limit=5&t=day`)
          .then(res => res.json())
          .then(json => {
            const dataArr = json.data.children;
            for (let i = 0; i < dataArr.length; i++) {
              message.channel.send(embedPost(dataArr[i].data));
            }
          });
      }
    } catch (e) {
      message.reply("The subreddit you asked for was not found");
      // console.log(e);
    }
    // returns an embed that is ready to be sent
    function embedPost(data) {
      return new Discord.MessageEmbed()
        .setColor("#FE9004")
        .setTitle(data.title)
        .setThumbnail(data.thumbnail)
        .setURL(`https://www.reddit.com${data.permalink}`)
        .setDescription(`Upvotes: ${data.score} :thumbsup: `)
        .setAuthor(data.author);
    }
  }
};
