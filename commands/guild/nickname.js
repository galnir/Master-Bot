const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class NicknameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nickname',
      aliases: ['set-nick', 'set-nickname'],
      group: 'guild',
      memberName: 'nickname',
      description:
        "Sets the selected member's nickname with the provided nickname",
      clientPermissions: ['MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_NICKNAMES'],
      guildOnly: true,
      args: [
        {
          key: 'memberName',
          prompt: 'Which member do you want to change the nickname of?',
          type: `member`,
          error: ':x: Member not found, please try again.'
        },
        {
          key: 'nickname',
          prompt: 'What name do you want to change their nickname to?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { memberName, nickname }) {
    var nickChanged = new MessageEmbed();

    if (nickname === 'remove') {
      try {
        await memberName.setNickname('');
      } catch {
        return message.reply(
          `:x: Can't change nickname, requested member has a higher role than you`
        );
      }
      try {
        nickChanged
          .setColor('RANDOM')
          .setTitle('Nickname Cleared!')
          .addField('Member', `${memberName.displayName}`)
          .addField('Moderator', `${message.author}`)
          .setThumbnail(memberName.user.displayAvatarURL({ dynamic: true }))
          .setFooter('Cleared', message.author.displayAvatarURL())
          .setTimestamp();

        //deletes message from author
        /* 
      if(message.deletable) {
      message.delete();
          }
          */

        return message.channel.send(nickChanged);
      } catch {
        return message.reply(':x: Something went wrong removing nickname');
      }
    } else {
      try {
        await memberName.setNickname(nickname);
      } catch {
        return message.reply(
          `:x: Can't change nickname, requested member has a higher role than you`
        );
      }
      try {
        const oldName = memberName.displayName;
        nickChanged
          .setColor('RANDOM')
          .setTitle('Nickname Changed!')
          .addField('Member', `${memberName.displayName}`)
          .addField('Old Name', `${oldName}`)
          .addField('New Name', `${nickname}`)
          .addField('Moderator', `${message.author}`)
          .setThumbnail(memberName.user.displayAvatarURL({ dynamic: true }))
          .setFooter('Changed', message.author.displayAvatarURL())
          .setTimestamp();

        //deletes message from author
        /*
      if (message.deletable) {
          message.delete();
      }
      */

        return message.channel.send(nickChanged);
      } catch {
        return message.reply(':x: Something went wrong changing nickname');
      }
    }
  }
};
