const { Command } = require('discord.js-commando');

module.exports = class StopMusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop-trivia',
      aliases: [
        'stop-music-trivia',
        'skip-trivia',
        'end-trivia',
        'stop-trivia'
      ],
      memberName: 'stop-trivia',
      group: 'music',
      description: 'End the music trivia!',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT']
    });
  }
  run(message) {
    if (!message.guild.triviaData.isTriviaRunning)
      return message.reply(':x: No trivia is currently running!');

    if (message.guild.me.voice.channel !== message.member.voice.channel) {
      return message.reply(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    if (!message.guild.triviaData.triviaScore.has(message.author.username)) {
      return message.reply(
        ':stop_sign: You need to participate in the trivia in order to end it'
      );
    }

    message.guild.triviaData.triviaQueue.length = 0;
    message.guild.triviaData.wasTriviaEndCalled = true;
    message.guild.triviaData.triviaScore.clear();
    message.guild.musicData.songDispatcher.end();
    return;
  }
};
