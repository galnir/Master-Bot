const { Command } = require('discord.js-commando');

module.exports = class EightBallCommand extends Command {
  constructor(client) {
    super(client, {
      name: '8ball',
      aliases: ['eightball'],
      memberName: '8Ball',
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
        const ballanswers = fs.readFileSync( //jsonquotes becomes ballanswers
      'resources/fun/8ball.json',
      'utf8'
    );
    const ballArray = JSON.parse(ballanswers).quotes; //quotearray becomes ball array

    const randomAnswer =
      ballArray[Math.floor(Math.random() * ballArray.length)];

    const answerEmbed = new MessageEmbed()
      .setTitle('Magic')
      .setDescription(randomAnswer.text)
      .setColor('#ff003c');
    return message.channel.send(answerEmbed);
  }
};
