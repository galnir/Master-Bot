const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu
} = require('discord.js');
const fetch = require('node-fetch');
const { PagesBuilder } = require('discord.js-pages');
const { MaxResponseTime } = require('../../options.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reddit')
    .setDescription(
      'Replies with 10 top daily posts in wanted subreddit, you can specify sorting and time!'
    )
    .addStringOption(option =>
      option
        .setName('subreddit')
        .setDescription('What subreddit would you like to search?')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('sort')
        .setDescription(
          'What posts do you want to see? Select from best/hot/top/new/controversial/rising'
        )
        .addChoice('best', 'best')
        .addChoice('hot', 'hot')
        .addChoice('new', 'new')
        .addChoice('top', 'top')
        .addChoice('controversial', 'controversial')
        .addChoice('rising', 'rising')
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = await interaction.deferReply({
      fetchReply: true
    });
    const subreddit = interaction.options.get('subreddit').value;
    const sort = interaction.options.get('sort').value;

    if (sort === 'top' || sort === 'controversial') {
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('top_or_controversial')
          .setPlaceholder('Please select an option')
          .addOptions([
            {
              label: 'hour',
              value: 'hour'
            },
            {
              label: 'week',
              value: 'week'
            },
            {
              label: 'month',
              value: 'month'
            },
            {
              label: 'year',
              value: 'year'
            },
            {
              label: 'all',
              value: 'all'
            }
          ])
      );
      const menu = await message.channel.send({
        content: `:loud_sound: Do you want to get the ${sort} posts from past hour/week/month/year or all?`,
        components: [row]
      });

      const collector = menu.createMessageComponentCollector({
        componentType: 'SELECT_MENU',
        time: MaxResponseTime * 1000
      });

      collector.on('end', () => {
        if (menu) menu.delete().catch(console.error);
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          i.reply({
            content: `This element is not for you!`,
            ephemeral: true
          });
        } else {
          collector.stop();
          const timeFilter = i.values[0];
          fetchFromReddit(interaction, subreddit, sort, timeFilter);
        }
      });
    } else {
      fetchFromReddit(interaction, subreddit, sort);
    }
  }
};

async function fetchFromReddit(
  interaction,
  subreddit,
  sort,
  timeFilter = 'day'
) {
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

  return new PagesBuilder(interaction).setPages(dataArr).build();
}
