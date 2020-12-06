const { Command } = require('discord.js-commando');

module.exports = class SummonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'summon',
      memberName: 'summon',
      group: 'guild',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      userPermissions: ['ADMINISTRATOR'],
      description: 'Allows an Admin to Summon the Bot to your voice-channel.'
    });
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.say(':no_entry: Please join a voice channel and try again!');
      return;
    }
    if (message.guild.triviaData.isTriviaRunning == true) {
      message.say(':x: Please try after the trivia has ended!');
      return;
    }
    if (message.guild.musicData.isPlaying != true) {
      message.say(':x: Nothing is Playing');
      return;
    }
    try {
      voiceChannel.join();
    } catch {
      return message.say(':x Something went wrong when moving channels');
    }
  }
};
