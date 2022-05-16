import type { TwitchStream } from './twitchAPI-types';
import { MessageEmbed } from 'discord.js';

export class TwitchEmbed {
  stream: TwitchStream;
  logo: string;
  gameArt: string;

  public constructor(stream: TwitchStream, logo: string, gameArt: string) {
    this.stream = stream;
    this.logo = logo;
    this.gameArt = gameArt;
  }

  public async TwitchEmbed(): Promise<MessageEmbed> {
    let baseEmbed = new MessageEmbed({
      author: {
        name: `Twitch Notification`,
        icon_url: this.logo,
        url: `https://twitch.tv/${this.stream.user_name}`
      },
      color: '#6441A5',
      url: `https://twitch.tv/${this.stream.user_name}`,
      footer: {
        text: `Stream Started`,
        iconURL:
          'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
      }
    });

    const min = Math.ceil(100);
    const max = Math.floor(10000000);

    baseEmbed
      .setThumbnail(this.gameArt.replace('-{width}x{height}', ''))
      .setTitle(`**${this.stream.user_name}** just went live!!!`)
      .addField('Title', this.stream.title ?? 'N/A')
      .addField(':video_game: Game', this.stream.game_name ?? 'N/A', true)
      .addField('Viewers', `${this.stream.viewer_count}`, true)
      .setImage(
        this.stream.thumbnail_url.replace('{width}x{height}', '1920x1080') +
          '?' +
          Math.floor(Math.random() * (max - min + 1)) +
          min
      )
      .setTimestamp(Date.parse(this.stream.started_at));

    return baseEmbed;
  }
}
