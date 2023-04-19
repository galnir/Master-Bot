import type { TwitchStream } from './twitchAPI-types';
import { EmbedBuilder } from 'discord.js';

export class TwitchEmbed {
  stream: TwitchStream;
  userName: string;
  logo: string;
  gameArt: string;
  ended: boolean;
  change: boolean;
  gameName?: string;
  title?: string;
  viewers?: number;

  public constructor(
    stream: TwitchStream,
    userName: string,
    logo: string,
    gameArt: string,
    ended: boolean,
    change: boolean,
    gameName?: string,
    title?: string,
    viewers?: number
  ) {
    this.stream = stream;
    this.userName = userName;
    this.logo = logo;
    this.gameArt = gameArt;
    this.ended = ended;
    this.change = change;
    this.gameName = gameName;
    this.title = title;
    this.viewers = viewers;
  }

  public async TwitchEmbed(): Promise<EmbedBuilder> {
    const notGames = [
      'Software and Game Development',
      'Just Chatting',
      'Retro',
      'Art',
      'Crypto',
      'Makers & Crafting'
    ];
    let gameOrTopic = ':video_game: Game';
    if (notGames.includes(this.gameName ?? this.stream.game_name))
      gameOrTopic = ':film_frames: Topic';

    if (this.ended) {
      const offlineEmbed = new EmbedBuilder({
        author: {
          name: `Twitch Notification - Stream Acabou`,
          icon_url: this.logo
        },
        color: 644115,
        footer: {
          text: `Stream Ended`,
          iconURL:
            'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
        }
      });
      return offlineEmbed
        .setThumbnail(this.logo)
        .setTitle(`${this.userName} stream acabou`)
        .addFields(
          { name: 'Title', value: this.title ?? 'N/A' },
          { name: gameOrTopic, value: this.gameName ?? 'N/A', inline: true },
          { name: 'Viewers', value: `${this.viewers}`, inline: true }
        )
        .setTimestamp();
    } else {
      const onlineEmbed = new EmbedBuilder({
        author: {
          name: `Twitch Notification - ${
            this.change ? 'Stream Update' : 'Stream Iniciada'
          }`,
          icon_url: this.logo,
          url: `https://twitch.tv/${this.userName}`
        },
        color: 644115,
        url: `https://twitch.tv/${this.userName}`,
        footer: {
          text: this.change ? 'Stream Update' : 'Stream Iniciada',
          iconURL:
            'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
        }
      });

      const title = this.change
        ? `**${this.stream?.user_name}** updated the stream!!!`
        : `**${this.stream?.user_name}** just went live!!!`;

      const min = Math.ceil(100);
      const max = Math.floor(10000000);

      onlineEmbed
        .setThumbnail(this.gameArt.replace('-{width}x{height}', ''))
        .setTitle(title)
        .addFields(
          { name: 'Title', value: this.stream?.title ?? 'N/A' },

          {
            name: gameOrTopic,
            value: this.stream?.game_name ?? 'N/A',
            inline: true
          },
          {
            name: 'Viewers',
            value: `${this.stream?.viewer_count}`,
            inline: true
          }
        )
        .setImage(
          this.stream.thumbnail_url.replace('{width}x{height}', '1920x1080') +
            '?' +
            Math.floor(Math.random() * (max - min + 1)) +
            min
        )
        .setTimestamp(
          this.change ? Date.now() : Date.parse(this.stream?.started_at!)
        );

      return onlineEmbed;
    }
  }
}
