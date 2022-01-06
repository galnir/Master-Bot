const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu
} = require('discord.js');
const fetch = require('node-fetch');
const { PaginatedMessage } = require('@sapphire/discord.js-utilities');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reddit')
    .setDescription('Get posts from reddit by specifying a subreddit')
    .addStringOption(option =>
      option
        .setName('subreddit')
        .setDescription('subreddit name')
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
    if (['controversial', 'top'].some(val => val === sort)) {
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('top_or_controversial')
          .setPlaceholder('Please select an option')
          .addOptions(optionsArray)
      );

      const menu = await message.channel.send({
        content: `:loud_sound: Do you want to get the ${sort} posts from past hour/week/month/year or all?`,
        components: [row]
      });

      const collector = menu.createMessageComponentCollector({
        componentType: 'SELECT_MENU',
        time: 30000 // 30 sec
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
  try {
    var json = await getData(subreddit, sort, timeFilter);
  } catch (error) {
    return interaction.followUp(error);
  }

  interaction.followUp('Fetching data from reddit');

  const paginatedEmbed = new PaginatedMessage();
  for (let i = 1; i <= json.data.children.length; i++) {
    let color = '#FE9004';
    let redditPost = json.data.children[i - 1];

    if (redditPost.data.title.length > 255) {
      redditPost.data.title = redditPost.data.title.substring(0, 252) + '...'; // max title length is 256
    }

    if (redditPost.data.over_18) color = '#cf00f'; // red - nsfw

    paginatedEmbed.addPageEmbed(embed =>
      embed
        .setColor(color)
        .setTitle(redditPost.data.title)
        .setURL(`https://www.reddit.com${redditPost.data.permalink}`)
        .setDescription(`Upvotes: ${redditPost.data.score} :thumbsup: `)
        .setAuthor(redditPost.data.author)
    );
  }

  const message = {
    author: {
      id: interaction.member.id,
      bot: interaction.user.bot
    },
    channel: interaction.channel
  };

  paginatedEmbed.run(message);
}

function getData(subreddit, sort, timeFilter) {
  return new Promise(async function (resolve, reject) {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=10&t=${
        timeFilter ? timeFilter : 'day'
      }`
    );
    const json = await response.json();

    if (!json.data) {
      reject(`**${subreddit}** is a private subreddit!`);
    } else if (!json.data.children.length) {
      reject('Please provide a valid subreddit name!');
    }
    resolve(json);
  });
}

const optionsArray = [
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
];
