const { MessageEmbed } = require('discord.js');
const prettyMilliseconds = require('pretty-ms');
const progressbar = require('string-progressbar');

function NowPlayingEmbed(track, position, length) {
  let baseEmbed = new MessageEmbed()
    .setTitle(track.title)
    .addField(
      'Duration',
      ':stopwatch: ' + prettyMilliseconds(length, { colonNotation: true }),
      true
    );

  // song just started embed
  if (position == undefined) {
    return baseEmbed;
  }
  const bar = progressbar.splitBar(length, position, 22)[0];
  baseEmbed.setDescription(
    `${prettyMilliseconds(position, {
      colonNotation: true
    })} ${bar} ${prettyMilliseconds(length, { colonNotation: true })}`
  );
  return baseEmbed;
}

module.exports = NowPlayingEmbed;
