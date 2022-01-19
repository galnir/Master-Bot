import { MessageEmbed } from 'discord.js';
import progressbar from 'string-progressbar';
import type { Song } from '@lavaclient/queue';

type PositionType = number | undefined;

export class NowPlayingEmbed {
  track: Song;
  position: PositionType;
  length: number;

  public constructor(track: Song, position: PositionType, length: number) {
    this.track = track;
    this.position = position;
    this.length = length;
  }

  public NowPlayingEmbed(): MessageEmbed {
    let trackLength = this.timeString(
      this.millisecondsToTimeObject(this.length)
    );

    if (!this.track.isSeekable) {
      trackLength = 'Live Stream';
      this.position = undefined;
    }

    let baseEmbed = new MessageEmbed()
      .setTitle(this.track.title)
      .addField('Duration', ':stopwatch: ' + trackLength, true);

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
