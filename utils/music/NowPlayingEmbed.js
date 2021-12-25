const { MessageEmbed } = require('discord.js');
const progressbar = require('string-progressbar');

function NowPlayingEmbed(track, position, length) {
  let trackLength = timeString(millisecondsToTimeObj(length));
  if (!track.isSeekable) {
    trackLength = 'Live Stream';
    position = undefined;
  }

  let baseEmbed = new MessageEmbed()
    .setTitle(track.title)
    .addField('Duration', ':stopwatch: ' + trackLength, true);

  // song just started embed
  if (position == undefined) {
    return baseEmbed;
  }
  const bar = progressbar.splitBar(length, position, 22)[0];
  baseEmbed.setDescription(
    `${timeString(millisecondsToTimeObj(position))} ${bar} ${trackLength}`
  );
  return baseEmbed;
}

module.exports = NowPlayingEmbed;

var timeString = timeObj => {
  if (timeObj[1] === true) return timeObj[0];
  return `${timeObj.hours ? timeObj.hours + ':' : ''}${
    timeObj.minutes ? timeObj.minutes : '00'
  }:${
    timeObj.seconds < 10
      ? '0' + timeObj.seconds
      : timeObj.seconds
      ? timeObj.seconds
      : '00'
  }`;
};

var millisecondsToTimeObj = ms => ({
  seconds: Math.floor((ms / 1000) % 60),
  minutes: Math.floor((ms / (1000 * 60)) % 60),
  hours: Math.floor((ms / (1000 * 60 * 60)) % 24)
});
