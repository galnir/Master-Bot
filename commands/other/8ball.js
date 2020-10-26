const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = class EightBallCommand extends Command {
  constructor(client) {
    super(client, {
      name: '8ball',
      aliases: ['eightball'],
      memberName: '8ball',
      group: 'other',
      description: 'Get the answer to anything!',
      args: [
        {
          key: 'text',
          prompt: 'What do you want to ask?',
          type: 'string'
        }
      ]
    });
  }

  run(message) {
    const ballAnswers = fs.readFileSync('resources/other/8ball.json', 'utf8');
    const ballArray = JSON.parse(ballAnswers).answers;

    const randomAnswer =
      ballArray[Math.floor(Math.random() * ballArray.length)];

    const answerEmbed = new MessageEmbed()
      .setTitle('Magic')
      .setDescription(randomAnswer.text)
      .setColor('#ff003c');
    return message.channel.send(answerEmbed);
  }
};
