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
          type: 'integer'
        }
      ]
    });
  }

  run(message, { songNumber }) {
    if (songNumber < 1 && songNumber >= message.guild.musicData.queue.length) {
      return message.reply('Please enter a valid song number');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `You must be in the same voice channel as the bot's in order to use that!`
      );
      return;
    }

    if (message.guild.musicData.queue < 1) {
      message.say('There are no songs in queue');
      return;
    }

    if (!message.guild.musicData.loopQueue) {
      message.guild.musicData.queue.splice(0, songNumber - 1);
      message.guild.musicData.loopSong = false;
      message.guild.musicData.songDispatcher.end();
    } else if (message.guild.musicData.loopQueue) {
      const slicedBefore = message.guild.musicData.queue.slice(
        0,
        songNumber - 1
      );
      const slicedAfter = message.guild.musicData.queue.slice(songNumber - 1);
      message.guild.musicData.queue = slicedAfter.concat(slicedBefore);
      message.guild.musicData.songDispatcher.end();
    }
  }
};
