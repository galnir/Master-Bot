const { Command } = require('discord.js-commando');
const playFile = require('./play.js');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['leave-command', 'leave-voice'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one'
    });
  }

  run(message) {
    const dispatcher = playFile.dispatcher;
    if (!message.guild.voiceConnection) {
      return message.say("I'm not in a voice channel right now");
    } else if (message.guild.voiceConnection) {
      dispatcher.end();
      return message.guild.voiceConnection.disconnect();
    }
  }
};
