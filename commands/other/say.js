const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      aliases: ['make-me-say', 'print'],
      memberName: 'say',
      group: 'other',
      description: 'Make the bot say anything!',
      args: [
        {
          key: 'text',
          prompt: ':microphone2: What do you want the bot to say?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { text }) {
    var embed = new MessageEmbed()
      .setTitle(`Just wanted to say...`)
      .setDescription(text)
      .setFooter(`That is all.`);
    return message.say(embed);
  }
};
