const { Command } = require('discord.js-commando');
const playFile = require('./play.js');

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

    var dispatcher = playFile.dispatcher;

    if (typeof dispatcher == 'undefined') {
      return message.reply('There is no song playing right now!');
    }

    this.client.queue.splice(songNumber - 1, 1);
    return message.say(`Removed song number ${songNumber} from queue`);
  }
};
