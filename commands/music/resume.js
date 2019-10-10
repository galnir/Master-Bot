const { Command } = require('discord.js-commando');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: ['resume-song', 'continue'],
      memberName: 'resume',
      group: 'music',
      description: 'Resume the current paused song',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof this.client.songDispatcher == 'undefined' ||
      this.client.songDispatcher === null
    ) {
      return message.reply('There is no song playing right now!');
    }

    message.say('Song resumed :play_pause:');

    this.client.songDispatcher.resume();
  }
};
