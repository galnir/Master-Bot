const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "reddit",
  cooldown: 0,
  description: "Gives you the top 5 reddit posts for the day",
  async execute(message) {
    try {
      await fetch("https://www.reddit.com/r/all/top/.json?limit=5&t=day")
        .then(res => res.json())
        .then(json => {
          const dataArr = json.data.children;
          for (let i = 0; i < dataArr.length; i++) {
            message.channel.send(embedPost(dataArr[i].data));
          }
        });
    } catch (e) {
      message.reply("Something went wrong :frowning: ");
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
