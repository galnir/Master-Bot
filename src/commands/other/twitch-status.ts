import { ApplyOptions } from '@sapphire/decorators';
import {
  ApplicationCommandRegistry,
  Command,
  CommandOptions,
  container
} from '@sapphire/framework';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';

@ApplyOptions<CommandOptions>({
  name: 'twitch-status',
  description: 'Check the status of your favorite streamer'
})
export class TwitchStatusCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const { client } = container;
    const interactionMember = interaction.member as GuildMember;
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
        name: 'Twitch Status',
        icon_url: user.profile_image_url,
        url: `https://twitch.tv/${user.display_name}`
      },
      color: 'DARK_PURPLE',
      url: `https://twitch.tv/${user.display_name}`,
      footer: {
        text: `Requested by ${interactionMember.displayName}`,
        iconURL: interactionMember.displayAvatarURL()
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
        .setTitle(`${user.display_name} is Online!!!`)
        .addField('Title', stream[0].title, true)
        .addField('Game', stream[0].game_name)
        .addField('Viewers', `${stream[0].viewer_count}`, true)
        .setImage(
          stream[0].thumbnail_url.replace('{width}x{height}', '1920x1080') +
            '?' +
            Math.floor(Math.random() * (max - min + 1)) +
            min
        );
    } else {
      baseEmbed
        .setThumbnail(user.profile_image_url)
        .setTitle(`${user.display_name} is Offline.`)
        .addField('Profile Description', user.description, true)
        .addField('Total Viewers', `${user.view_count}`, true);
    }
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
