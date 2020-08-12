const { Command } = require('discord.js-commando');
//const { MessageEmbed } = require('discord.js');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loopqueue',
      memberName: 'loopqueue',
      aliases: ['loop-queue', 'queue-loop'],
      group: 'music',
      description: 'Loop the queue x times(the default is 1 time)',
      guildOnly: true,
      args: [
        {
          key: 'numOfTimesToLoop',
          default: 1,
          type: 'integer',
          prompt: 'How many times do you want to loop the queue?'
        }
      ]
    });
  }

  run(message, { numOfTimesToLoop }) {
    if (!message.guild.musicData.isPlaying) {
      message.say('There is no song playing right now!');
      return;
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      message.say('You cannot loop over a trivia!');
      return;
    } else if (message.guild.musicData.queue.length == 0) {
      message.say(`I can't loop over an empty queue!`);
      return;
    }
    const queue = message.guild.musicData.queue;
    let newQueue = [];
    for (let i = 0; i < numOfTimesToLoop; i++) {
      newQueue = newQueue.concat(queue);
    }
    message.guild.musicData.queue = newQueue;
    // prettier-ignore
    message.channel.send(
      `Looped the queue ${numOfTimesToLoop} ${
        (numOfTimesToLoop == 1) ? 'time' : 'times'
      }`
    );
    return;
  }
};
