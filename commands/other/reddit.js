const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');

module.exports = class RedditCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reddit',
      aliases: ['subreddit', 'reddit-search'],
      group: 'other',
      memberName: 'reddit',
      description: 'Replies with 5 top non nsfw subreddit posts',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'text',
          prompt: 'What subreddit would you like to search?',
          type: 'string',
          default: 'all',
          validate: text => text.length < 50
        }
      ]
    });
  }

  async run(message, { text }) {
    try {
      await fetch(`https://www.reddit.com/r/${text}/top/.json?limit=5&t=day`)
        .then(res => res.json())
        .then(json => {
          const dataArr = json.data.children;
          for (let i = 0; i < dataArr.length; i++) {
            if (dataArr[i].data.over_18 === true) {
              message.say(':no_entry: nsfw :no_entry:');
            } else {
              message.say(embedPost(dataArr[i].data));
            }
          }
        });
    } catch (e) {
      message.say('The subreddit you asked for was not found');
      return console.log(e);
    }
    // returns an embed that is ready to be sent
    function embedPost(data) {
      if (data.title > 200) {
        data.title = '';
      }
      return new MessageEmbed()
        .setColor('#FE9004')
        .setTitle(data.title)
        .setThumbnail(
          data.thumbnail === 'self'
            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Reddit.svg/256px-Reddit.svg.png'
            : data.thumbnail
        )
        .setURL(`https://www.reddit.com${data.permalink}`)
        .setDescription(`Upvotes: ${data.score} :thumbsup: `)
        .setAuthor(data.author);
    }
  }
};
