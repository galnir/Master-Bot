const { Command } = require('discord.js-commando');

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipall',
      aliases: ['skip-all'],
      memberName: 'skipall',
      group: 'music',
      description: 'Skip all songs in queue',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof this.client.songDispatcher == 'undefined' ||
      this.client.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }
    if (!this.client.queue) return message.say('There are no songs in queue');
    this.client.songDispatcher.end();
    this.client.queue.length = 0; // clear queue
    return;
  }
};
