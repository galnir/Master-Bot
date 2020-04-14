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
      description:
        'Replies with 10 top daily posts in wanted subreddit, you can specify sorting and time',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'subreddit',
          prompt: 'What subreddit would you like to search?',
          type: 'string',
          default: 'all',
          max: 50,
          wait: 20
        },
        {
          key: 'sort',
          prompt:
            'What posts do you want to see? Select from best/hot/top/new/controversial/rising',
          type: 'string',
          default: 'top',
          validate: function(sort) {
            return (
              sort === 'best' ||
              sort === 'hot' ||
              sort === 'new' ||
              sort === 'top' ||
              sort === 'controversial' ||
              sort === 'rising'
            );
          },
          wait: 10
        }
      ]
    });
  }

  // If you want to restrict nsfw posts, remove the commented out code below

  async run(message, { subreddit, sort }) {
    if (sort === 'top' || sort === 'controversial') {
      await message.say(
        `Do you want to get the ${sort} posts from past hour/week/month/year or all?`
      );
      try {
        var t = await message.channel.awaitMessages(
          msg =>
            msg.content === 'hour' ||
            msg.content === 'week' ||
            msg.content === 'month' ||
            msg.content === 'year' ||
            msg.content === 'all',
          {
            max: 1,
            maxProcessed: 1,
            time: 60000,
            errors: ['time']
          }
        );
        var timeFilter = t.first().content;
      } catch (e) {
        console.error(e);
        return message.say('Please try again and enter a proper time filter');
      }
    }
    fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=10&t=${
        timeFilter ? timeFilter : 'day'
      }`
    )
      .then(res => res.json())
      .then(json => {
        const dataArr = json.data.children;
        for (let i = 0; i < dataArr.length; i++) {
          // if (dataArr[i].data.over_18 === true) {
          //   message.say(':no_entry: nsfw :no_entry:');
          // } else {
          message.say(embedPost(dataArr[i].data));
          //}
        }
      })
      .catch(err => {
        message.say('The subreddit you asked for was not found');
        return console.error(err);
      });
    // returns an embed that is ready to be sent
    function embedPost(data) {
      let color = '#FE9004';
      if (data.title.length > 255) {
        data.title = data.title.substring(0, 252) + '...'; // discord.js does not allow embed title lengths greater than 256
      }
      if (data.over_18) color = '#cf000f';
      return new MessageEmbed()
        .setColor(color) // if post is nsfw, color is red
        .setTitle(data.title)
        .setURL(`https://www.reddit.com${data.permalink}`)
        .setDescription(`Upvotes: ${data.score} :thumbsup: `)
        .setAuthor(data.author);
    }
  }
};
