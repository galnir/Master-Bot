const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class RedditCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reddit',
      aliases: ['subreddit', 'reddit-search'],
      group: 'other',
      memberName: 'reddit',
      description:
        'Replies with 10 top daily posts in wanted subreddit, you can specify sorting and time!',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'subreddit',
          prompt: ':mag: What subreddit would you like to search?',
          type: 'string',
          default: 'all',
          max: 50,
          wait: 20
        },
        {
          key: 'sort',
          prompt:
            ':mag: What posts do you want to see? Select from best/hot/top/new/controversial/rising',
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
      await message.channel.send(
        `:loud_sound: Do you want to get the ${sort} posts from past hour/week/month/year or all?`
      );
      try {
        var t = await message.channel.awaitMessages(
          msg =>
            msg.content.toLowerCase() === 'hour' ||
            msg.content.toLowerCase() === 'week' ||
            msg.content.toLowerCase() === 'month' ||
            msg.content.toLowerCase() === 'year' ||
            msg.content.toLowerCase() === 'all',
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
        message.reply(':x: Please try again and enter a proper time filter!');
        return;
      }
    }
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=10&t=${
        timeFilter ? timeFilter : 'day'
      }`
    );

    const json = await response.json();
    const dataArr = [];

    for (let i = 1; i <= json.data.children.length; ++i) {
      var color = '#FE9004';
      var redditPost = json.data.children[i - 1];

      if (redditPost.data.title.length > 255)
        redditPost.data.title = redditPost.data.title.substring(0, 252) + '...'; // discord.js does not allow embed title lengths greater than 256

      if (redditPost.data.over_18) color = '#cf000f';

      dataArr.push(
        new MessageEmbed()
          .setColor(color) // if post is nsfw, color is red
          .setTitle(redditPost.data.title)
          .setURL(`https://www.reddit.com${redditPost.data.permalink}`)
          .setDescription(`Upvotes: ${redditPost.data.score} :thumbsup: `)
          .setAuthor(redditPost.data.author)
      );
    }

    const embed = new Pagination.Embeds()
      .setArray(dataArr)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setPageIndicator(true);

    embed.build();
  }
};
