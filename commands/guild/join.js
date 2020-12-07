const { Command } = require('discord.js-commando');

module.exports = class WecomeMessageTestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      memberName: 'join',
      group: 'guild',
      guildOnly: true,
      description: 'Lets you see the Welcome Image with its current settings'
    });
  }

  run() {
    return;
    /*
    //place holder file
    //The Following is inside index.js
    
    client.on('message', message => {
    if (message.content === `${prefix}join`) {
      client.emit('guildMemberAdd', message.member);
      }
    });
    */
  }
};
