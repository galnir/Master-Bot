const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class WecomeMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'welcome-message',
      memberName: 'welcome-message',
      aliases: ['welcomemessage', 'welcome'],
      group: 'guild',
      guildOnly: true,
      clientPermissions: ['ADMINISTRATOR'],
      description: 'Allows you to toggle the welcome message for new members that join the server.',
      args: [
        {
          key: 'choice',
          prompt:
            'Do you want me to welcome new members? Type Yes or No',
          type: 'string',
          oneOf: ['yes', 'no', 'enable', 'disable']
        }
      ]
    });
  }

  run(message, { choice }) {
    if (choice.toLowerCase() == 'enable')  choice = 'yes';

    if (choice.toLowerCase() == 'disable')  choice = 'no';

    db.set(`${message.member.guild.id}.serverSettings.welcomeMsgStatus`, choice.toLowerCase() );

    if (choice.toLowerCase() == 'yes')
      message.say(`Welcome Message Enabled on ${message.member.guild.name}`);

    if (choice.toLowerCase() == 'no')
      message.say(`Welcome Message Disabled on ${message.member.guild.name}`);
  }
};
