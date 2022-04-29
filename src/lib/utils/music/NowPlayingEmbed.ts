import { MessageEmbed } from 'discord.js';
import progressbar from 'string-progressbar';
import type { Song } from '../queue/Song';

type PositionType = number | undefined;

export class NowPlayingEmbed {
  track: Song;
  position: PositionType;
  length: number;
  volume: number;
  queue?: Song[];

  public constructor(
    track: Song,
    position: PositionType,
    length: number,
    volume: number,
    queue?: Song[]
  ) {
    this.track = track;
    this.position = position;
    this.length = length;
    this.volume = volume;
    this.queue = queue;
  }

  public NowPlayingEmbed(): MessageEmbed {
    let trackLength = this.timeString(
      this.millisecondsToTimeObject(this.length)
    );
    if (!this.track.isSeekable) {
      trackLength = 'Live Stream';
      this.position = undefined;
    }
    const userAvatar = `https://cdn.discordapp.com/avatars/${this.track.userInfo?.user.id}/${this.track.userInfo?.user.avatar}.png`;

    let baseEmbed = new MessageEmbed()
      .setTitle(`:musical_note: ${this.track.title}`)
      .setURL(this.track.uri)
      .setThumbnail(this.track.thumbnail)
      .setColor('#FF0000')
      .addField('Volume', ':loud_sound: ' + this.volume, true)
      .addField('Duration', ':stopwatch: ' + trackLength, true)
      .setTimestamp()
      .setFooter({
        text: `Requested By ${this.track.userInfo?.nickname}`,
        iconURL: userAvatar
      });
    if (this.queue?.length) {
      baseEmbed
        .addField('Queue', ':notes: ' + this.queue.length, true)
        .addField('Next', `[${this.queue[0].title}](${this.queue[0].uri})`);
    }

    // song just started embed
    if (this.position == undefined) {
      return baseEmbed;
    }
    const bar = progressbar.splitBar(this.length, this.position, 22)[0];
    baseEmbed.setDescription(
      `${this.timeString(
        this.millisecondsToTimeObject(this.position)
      )} ${bar} ${trackLength}`
    );

    return baseEmbed;
  }

  private timeString(timeObject: any) {
    if (timeObject[1] === true) return timeObject[0];
    return `${timeObject.hours ? timeObject.hours + ':' : ''}${
      timeObject.minutes ? timeObject.minutes : '00'
    }:${
      timeObject.seconds < 10
        ? '0' + timeObject.seconds
        : timeObject.seconds
        ? timeObject.seconds
        : '00'
    }`;
  }

  private millisecondsToTimeObject(milliseconds: number) {
    return {
      seconds: Math.floor((milliseconds / 1000) % 60),
      minutes: Math.floor((milliseconds / (1000 * 60)) % 60),
      hours: Math.floor((milliseconds / (1000 * 60 * 60)) % 24)
    };
  }
}
