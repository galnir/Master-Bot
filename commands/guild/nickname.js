const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class NicknameCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nickname',
      aliases: ['nick'],
      group: 'moderation',
      memberName: 'nickname',
      description: 'Sets the selected member\'s nickname with the provided nickname',
      clientPermissions: ['MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_NICKNAMES'],
      guildOnly: true,
      args: [
        {
            key: 'member',
            prompt: 'Which member do you want to change the nickname of?',
            type: 'member'
        },
        {
            key: 'nickname',
            prompt: 'What name do you want to change their nickname to?',
            type: 'string'
        }
    ]
    });
  }

async run (message, { member, nickname }) {
     if(nickname === 'remove') {
        const nickRemoved = new MessageEmbed();
		
  	await member.setNickname('');
  		
  	nickRemoved	
  	  .setColor('RANDOM')
  	  .setTitle('Nickname Cleared!')
  	  .addField('Member', `<@${member.id}>`)
  	  .addField('Moderator', `${message.author}`);
  		   
        //deletes message from author
  	/* 
  	if(message.deletable) {
  	message.delete();
        }
        */ 
  		   
  return message.channel.send(nickRemoved);
  		
  	} else {
  		
    const oldName = member.displayName;
    const nicknameEmbed = new MessageEmbed();

    await member.setNickname(nickname);

    nicknameEmbed
      .setColor('RANDOM')
      .setTitle('Nickname Changed!')
      .addField('Member', `<@${member.id}>`)
      .addField('Old Name', `${oldName}`)
      .addField('New Name', `${nickname}`)
      .addField('Moderator', `${message.author}`);

    //deletes message from author
    /*
    if (message.deletable) {
        message.delete();
    }
    */

    return message.channel.send(nicknameEmbed);
    }
  }
};
