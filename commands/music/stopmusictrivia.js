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
      description: 'End the music trivia',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT']
    });
  }
  run(message) {
    if (!message.guild.triviaData.isTriviaRunning)
      return message.say('No trivia is currently running');

    if (message.guild.me.voice.channel !== message.member.voice.channel) {
      return message.say("Join the trivia's channel and try again");
    }

    if (!message.guild.triviaData.triviaScore.has(message.member.displayName)) {
      return message.say(
        'You need to participate in the trivia in order to end it'
      );
    }

    message.guild.triviaData.triviaQueue.length = 0;

    message.guild.triviaData.wasTriviaEndCalled = true;

    message.guild.musicData.songDispatcher.end();
    return;
  }
};
