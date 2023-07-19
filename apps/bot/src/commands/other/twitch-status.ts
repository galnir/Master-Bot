import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import Logger from '../../lib/utils/logger';

@ApplyOptions<CommandOptions>({
  name: 'twitch-status',
  description: 'Check the status of your favorite streamer',
  preconditions: ['isCommandDisabled']
})
export class TwitchStatusCommand extends Command {
  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const { client } = container;
    const query = interaction.options.getString('streamer', true).toString();

    try {
      let user = await client.twitch.api.getUser({
        token: client.twitch.auth.access_token,
        login: query
      });

      if (!user)
        return interaction.reply({ content: `${query} was not Found` });
      const stream = await client.twitch.api.getStreamingUsers({
        token: client.twitch.auth.access_token,
        user_ids: [user.id]
      });
      let baseEmbed = new EmbedBuilder({
        author: {
          name: `Status Check: ${
            stream[0]?.type == 'live'
              ? `${user.display_name} - Online`
              : `${user.display_name} - Offline`
          }`,
          iconURL: user.profile_image_url,
          url: `https://twitch.tv/${user.display_name}`
        },
        color: 644115,
        url: `https://twitch.tv/${user.display_name}`,
        footer: {
          text: stream[0]?.type ? `Stream Started` : 'Joined Twitch',
          iconURL:
            'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
        }
      });

      if (stream[0]?.type == 'live') {
        const min = Math.ceil(100);
        const max = Math.floor(10000000);
        const game = await client.twitch.api.getGame({
          token: client.twitch.auth.access_token,
          id: stream[0].game_id
        });

        baseEmbed
          .setThumbnail(game.box_art_url.replace('-{width}x{height}', ''))
          .setTitle(`Looks like ${user.display_name} is Online!!!`)
          .addFields(
            { name: 'Title', value: stream[0].title ?? 'N/A' },
            {
              name: ':video_game: Game',
              value: stream[0].game_name ?? 'N/A',
              inline: true
            },
            {
              name: 'Viewers',
              value: `${stream[0].viewer_count}`,
              inline: true
            }
          )
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
          .addFields(
            {
              name: 'Profile Description',
              value: user.description == '' ? 'None' : user.description
            },
            { name: 'Total Viewers', value: `${user.view_count}`, inline: true }
          )
          .setTimestamp(Date.parse(user.created_at));
      }

      // make sure it's last in both
      baseEmbed.addFields({
        name: 'Rank',
        value:
          user.broadcaster_type != ''
            ? user.broadcaster_type.charAt(0).toUpperCase() +
              user.broadcaster_type.slice(1)
            : 'Base',
        inline: true
      });

      return await interaction.reply({ embeds: [baseEmbed] });
    } catch (error: any) {
      Logger.error(error);
      if (error.status == 400) {
        return interaction.reply({
          content: `:x: "${query}" was Invalid, Please try again.`
        });
      }
      if (error.status == 429) {
        return interaction.reply({
          content: ':x: Rate Limit exceeded. Please try again in a few minutes.'
        });
      }
      if (error.status == 500) {
        return interaction.reply({
          content: `:x: Twitch service's are currently unavailable. Please try again later.`
        });
      } else {
        Logger.http(`${this.name} Command - ${JSON.stringify(error)}`);
        return interaction.reply({
          content: `:x: Something went wrong.`
        });
      }
    }
  }

  public override registerApplicationCommands(
    registry: Command.Registry
  ): void {
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      Logger.info('Twitch-Status-Command - Disabled');
      return;
    }
    Logger.info('Twitch-Status-Command - Enabled');

    registry.registerChatInputCommand(builder =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option =>
          option
            .setName('streamer')
            .setDescription('The Streamers Name')
            .setRequired(true)
        )
    );
  }
}
