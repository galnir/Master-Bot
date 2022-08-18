import type { TwitchStream } from './twitchAPI-types';
import { MessageEmbed } from 'discord.js';

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

  public async TwitchEmbed(): Promise<MessageEmbed> {
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
      const offlineEmbed = new MessageEmbed({
        author: {
          name: `Twitch Notification - Stream Ended`,
          icon_url: this.logo
        },
        color: '#6441A5',
        footer: {
          text: `Stream Ended`,
          iconURL:
            'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' // Twitch Icon
        }
      });
      return offlineEmbed
        .setThumbnail(this.logo)
        .setTitle(`${this.userName}'s stream has Ended`)
        .addField('Title', this.title ?? 'N/A')
        .addField(gameOrTopic, this.gameName ?? 'N/A', true)
        .addField('Viewers', `${this.viewers}`, true)
        .setTimestamp();
    } else {
      const onlineEmbed = new MessageEmbed({
        author: {
          name: `Twitch Notification - ${
            this.change ? 'Stream Update' : 'Stream Started'
          }`,
          icon_url: this.logo,
          url: `https://twitch.tv/${this.userName}`
        },
        color: '#6441A5',
        url: `https://twitch.tv/${this.userName}`,
        footer: {
          text: this.change ? 'Stream Update' : 'Stream Started',
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
        .addField('Title', this.stream?.title ?? 'N/A')
        .addField(gameOrTopic, this.stream?.game_name ?? 'N/A', true)
        .addField('Viewers', `${this.stream?.viewer_count}`, true)
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
