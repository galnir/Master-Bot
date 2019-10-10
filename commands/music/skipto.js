const { Command } = require('discord.js-commando');

module.exports = class SkipToCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipto',
      memberName: 'skipto',
      group: 'music',
      description:
        'Skip to a specific song in the queue, provide the song number as an argument',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt:
            'What is the number in queue of the song you want to skip to?, it needs to be greater than 1',
          type: 'integer',
          validate: songNumber =>
            songNumber > 1 && songNumber <= this.client.queue.length
        }
      ]
    });
  }

  run(message, { songNumber }) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof this.client.songDispatcher == 'undefined' ||
      this.client.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    }

    if (this.client.queue < 1)
      return message.say('There are no songs in queue');

    this.client.queue.splice(0, songNumber - 1);
    this.client.songDispatcher.end();
    return;
  }
};
