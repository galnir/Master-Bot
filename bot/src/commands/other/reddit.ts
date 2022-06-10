import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions
} from '@sapphire/framework';
import {
  ColorResolvable,
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu
} from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';

@ApplyOptions<CommandOptions>({
  name: 'reddit',
  description: 'Get posts from reddit by specifying a subreddit',
  preconditions: ['GuildOnly']
})
export class AdviceCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    await interaction.deferReply();
    const channel = interaction.channel;
    if (!channel) return await interaction.reply('Something went wrong :('); // type guard
    const subreddit = interaction.options.getString('subreddit', true);
    const sort = interaction.options.getString('sort', true);

    if (['controversial', 'top'].some(val => val === sort)) {
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId('top_or_controversial')
          .setPlaceholder('Please select an option')
          .addOptions(optionsArray)
      );

      const menu = await channel.send({
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
            content: 'This element is not for you!',
            ephemeral: true
          });
        } else {
          collector.stop();
          const timeFilter = i.values[0];
          this.fetchFromReddit(interaction, subreddit, sort, timeFilter);
        }
      });
    } else {
      this.fetchFromReddit(interaction, subreddit, sort);
    }
  }

  private async fetchFromReddit(
    interaction: CommandInteraction,
    subreddit: string,
    sort: string,
    timeFilter = 'day'
  ) {
    try {
      var data = await this.getData(subreddit, sort, timeFilter);
    } catch (error: any) {
      return interaction.followUp(error);
    }

    interaction.followUp('Fetching data from reddit');

    const paginatedEmbed = new PaginatedMessage();
    for (let i = 1; i <= data.children.length; i++) {
      let color: ColorResolvable = '#FE9004';
      let redditPost = data.children[i - 1];

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
          .setAuthor({ name: redditPost.data.author })
      );
    }

    const message = {
      author: {
        id: interaction.user.id,
        bot: interaction.user.bot
      },
      channel: interaction.channel
    };
    // @ts-ignore
    return paginatedEmbed.run(message);
  }

  private getData(
    subreddit: string,
    sort: string,
    timeFilter: string
  ): Promise<any> {
    return new Promise(async function (resolve, reject) {
      const response = await axios.get(
        `https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=10&t=${
          timeFilter ? timeFilter : 'day'
        }`
      );
      const data = response.data.data;
      if (!data) {
        reject(`**${subreddit}** is a private subreddit!`);
      } else if (!data.children.length) {
        reject('Please provide a valid subreddit name!');
      }
      resolve(data);
    });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'subreddit',
          type: 'STRING',
          required: true,
          description: 'Subreddit name'
        },
        {
          name: 'sort',
          type: 'STRING',
          required: true,
          description:
            'What posts do you want to see? Select from best/hot/top/new/controversial/rising',
          choices: [
            {
              name: 'Best',
              value: 'best'
            },
            {
              name: 'Hot',
              value: 'hot'
            },
            {
              name: 'New',
              value: 'new'
            },
            {
              name: 'Top',
              value: 'top'
            },
            {
              name: 'Controversial',
              value: 'controversial'
            },
            {
              name: 'Rising',
              value: 'rising'
            }
          ]
        }
      ]
    });
  }
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
