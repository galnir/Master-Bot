const { Command } = require('discord.js-commando');
const playFile = require('./play.js');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['skip-song', 'advance-song'],
      memberName: 'skip',
      group: 'music',
      description: 'Skip the current playing song',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    var dispatcher = playFile.dispatcher;

    if (typeof dispatcher == 'undefined') {
      return message.reply('There is no song playing right now!');
    }
    var queue = playFile.queue;
    if (queue >= 1) {
      queue.shift();
      return playFile.playSong(queue, message);
    } else {
      dispatcher.end();
    }
  }
};
