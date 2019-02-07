const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "reddit",
  cooldown: 5,
  description:
    "Gives you the top 5 reddit posts for the day(no nsfw subreddits)",
  async execute(message, args) {
    //console.log(args);
    try {
      // user provides no args
      if (!args) {
        await fetch("https://www.reddit.com/r/all/top/.json?limit=5&t=day")
          .then(res => res.json())
          .then(json => {
            const dataArr = json.data.children;
            for (let i = 0; i < dataArr.length; i++) {
              message.channel.send(embedPost(dataArr[i].data));
            }
          });
        // user provides args
      } else {
        await fetch(`https://www.reddit.com/r/${args}/top/.json?limit=5&t=day`)
          .then(res => res.json())
          .then(json => {
            const dataArr = json.data.children;
            for (let i = 0; i < dataArr.length; i++) {
              if (dataArr[i].data.over_18 === true) {
                message.channel.send(":no_entry: nsfw :no_entry:");
              } else {
                message.channel.send(embedPost(dataArr[i].data));
              }
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
