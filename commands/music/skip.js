const { Command } = require('discord.js-commando');
const playFile = require('./play.js'); // importing the stuff I exported in play.js

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
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (typeof playFile.dispatcher == 'undefined') {
      return message.reply('There is no song playing right now!');
    }
    playFile.dispatcher.end();
    /* when dispatcher.end function is called, it basically goes to the
       .on('finish') method, and there we call queue.shift() to remove the 
       skipped song from queue and decide if to call playSong method again 
    */
  }
};
