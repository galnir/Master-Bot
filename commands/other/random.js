const { Command } = require('discord.js-commando');

module.exports = class RandomNumberCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'random',
      aliases: ['random-number', 'number-between'],
      memberName: 'random',
      group: 'other',
      description: 'Generate a random number between two provided numbers',
      args: [
        {
          key: 'min',
          prompt: 'What is the minimum number?',
          type: 'integer'
        },
        {
          key: 'max',
          prompt: 'What is the maximum number?',
          type: 'integer'
        }
      ]
    });
  }

  run(message, { min, max }) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return message.say(Math.floor(Math.random() * (max - min + 1)) + min);
  }
};
