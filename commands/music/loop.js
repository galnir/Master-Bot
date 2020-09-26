const { Command } = require('discord.js-commando');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      guildOnly: true,
      description: 'Loop the currently playing song'
    });
  }

  run(message) {
    if (!message.guild.musicData.isPlaying) {
      return message.say('There is no song playing right now!');
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say('You cannot loop over a trivia!');
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        `You must be in the same voice channel as the bot's in order to use that!`
      );
      return;
    }

    if (message.guild.musicData.loopSong) {
      message.guild.musicData.loopSong = false;
      message.channel.send(
        `**${message.guild.musicData.nowPlaying.title}** is no longer playing on loop`
      );
    } else {
      message.guild.musicData.loopSong = true;
      message.channel.send(
        `**${message.guild.musicData.nowPlaying.title}** is now playing on loop`
      );
    }
  }
};
