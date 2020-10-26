const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class RPSCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rps',
      aliases: ['rock-paper-scissors', 'rock'],
      group: 'other',
      memberName: 'other',
      description: 'Rock paper scissors'
    });
  }

  run(message) {
    const replies = ['Rock', 'Paper', 'Scissors'];
    const reply = replies[Math.floor(Math.random() * replies.length)];

    const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Rock, Paper, Scissors')
      .setDescription(`**${reply}**`);
    message.channel.send(embed);
    return;
  }
};
