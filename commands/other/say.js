const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      aliases: ['make-me-say', 'print'],
      memberName: 'say',
      group: 'other',
      description: 'Make the bot say anything',
      args: [
        {
          key: 'text',
          prompt: 'What do you want the bot to say?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { text }) {
    return message.say(text);
  }
};
