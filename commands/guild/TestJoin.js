const { Command } = require('discord.js-commando');

module.exports = class WecomeMessageTestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      memberName: 'join',
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['ADMINISTRATOR'],
      description: 'Lets you see the Join Image to see your current settings'
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
