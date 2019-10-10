const { Command } = require('discord.js-commando');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'music',
      description: 'Remove a specific song from queue',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt: 'What song number do you want to remove from queue?',
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

    this.client.queue.splice(songNumber - 1, 1);
    return message.say(`Removed song number ${songNumber} from queue`);
  }
};
