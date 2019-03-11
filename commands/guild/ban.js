const { Command } = require('discord.js-commando');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban-member', 'ban-hammer'],
      memberName: 'ban',
      group: 'guild',
      description: 'Bans a tagged member',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToBan',
          prompt: 'Who do you want to ban?',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why do you want to ban this user',
          type: 'string'
        }
      ]
    });
  }

  run(message, { reason }) {
    const user = message.mentions.members.first();
    user
      .ban(reason)
      .then(() => message.say(`Banned ${user} reason: ${reason}`))
      .catch(e => {
        message.say('Something went wrong when trying to ban this user');
        return console.error(e);
      });
  }
};
