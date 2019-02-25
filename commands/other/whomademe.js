const { Command } = require('discord.js-commando');

module.exports = class WhoMadeMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'whomademe',
      aliases: ['bot-maker', 'bot-creator'],
      memberName: 'whomademe',
      group: 'other',
      description: "Replies with the bot creator's name"
    });
  }

  run(message) {
    message.say(
      'Made by @hyperzone#1185 with :heart: see repo here https://github.com/galnir/discordBot'
    );
  }
};
