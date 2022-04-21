import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import { CommandInteraction, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'twitch-status',
  description: 'Check the status of your favorite streamer'
})
export class TwitchStatusCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const query = interaction.options.getString('streamer', true).toString();

    const user = await client.twitch.api.getUser({
      token: client.twitch.auth.access_token,
      login: query
    });

    if (!user) return interaction.reply({ content: 'User was not Found' });
    const stream = await client.twitch.api.getStreamingUsers({
      token: client.twitch.auth.access_token,
      user_ids: [user.id]
    });

    let baseEmbed = new MessageEmbed({
      author: {
        name: `${user.display_name} - Status `,
        icon_url: user.profile_image_url,
        url: `https://twitch.tv/${user.display_name}`
      },
      color: '#6441a5',
      url: `https://twitch.tv/${user.display_name}`,
      footer: {
        text: stream[0]?.type ? `Stream Started` : 'Joined Twitch',
        iconURL:
          'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
      }
    });

    if (stream[0]?.type == 'live') {
      const game = await client.twitch.api.getGame({
        token: client.twitch.auth.access_token,
        id: stream[0].game_id
      });
      const min = Math.ceil(100);
      const max = Math.floor(10000000);
      baseEmbed
        .setThumbnail(game.box_art_url.replace('-{width}x{height}', ''))
        .setTitle(`Looks like ${user.display_name} is Online!!!`)
        .addField('Title', stream[0].title)
        .addField('Game', stream[0].game_name, true)
        .addField('Viewers', `${stream[0].viewer_count}`, true)
        .setImage(
          stream[0].thumbnail_url.replace('{width}x{height}', '1920x1080') +
            '?' +
            Math.floor(Math.random() * (max - min + 1)) +
            min
        )
        .setTimestamp(Date.parse(stream[0].started_at));
    } else {
      baseEmbed
        .setThumbnail(user.profile_image_url)
        .setTitle(`Looks like ${user.display_name} is Offline.`)
        .addField('Profile Description', user.description)
        .addField('Total Viewers', `${user.view_count}`, true)
        .setTimestamp(Date.parse(user.created_at));
    }
    // make sure its last in both
    user.broadcaster_type
      ? baseEmbed.addField(
          'Rank',
          user.broadcaster_type.charAt(0).toUpperCase() +
            user.broadcaster_type.slice(1),
          true
        )
      : null;
    return await interaction.reply({ embeds: [baseEmbed] });
  }

  public override registerApplicationCommands(
    registery: ApplicationCommandRegistry
  ): void {
    registery.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: 'STRING',
          required: true,
          name: 'streamer',
          description: 'The Streamers Name'
        }
      ]
    });
  }
}
