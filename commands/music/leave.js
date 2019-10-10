const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['stop', 'end'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one'
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
    this.client.queue.length = 0;
    return;
  }
};
