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
    if (nickname === 'remove') {
      try {
        await memberName.setNickname('');
      } catch {
        message.reply(
          `:x: Can't change nickname, requested member has a higher role than you`
        );
        return;
      }
      try {
        const nickRemoved = new MessageEmbed();
        nickRemoved
          .setColor('RANDOM')
          .setTitle('Nickname Cleared!')
          .addField('Member', `${memberName.user.username}`)
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

        message.channel.send(nickRemoved);
        return;
      } catch {
        message.reply(':x: Something went wrong removing nickname');
        return;
      }
    } else {
      const oldName = memberName.displayName;
      try {
        await memberName.setNickname(nickname);
      } catch {
        message.reply(
          `:x: Can't change nickname, requested member has a higher role than you`
        );
        return;
      }
      try {
        const nickChanged = new MessageEmbed();
        nickChanged
          .setColor('RANDOM')
          .setTitle('Nickname Changed!')
          .addField('Member', `${memberName.user.username}`)
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

        message.channel.send(nickChanged);
        return;
      } catch {
        message.reply(':x: Something went wrong when changing nickname');
        return;
      }
    }
  }
};
