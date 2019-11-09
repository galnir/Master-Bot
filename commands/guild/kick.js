const { Command } = require('discord.js-commando');

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      aliases: ['kick-member', 'throw'],
      memberName: 'kick',
      group: 'guild',
      description: 'Kicks a tagged member',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToKick',
          prompt: 'Who do you want to kick?',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why do you want to kick this user',
          type: 'string'
        }
      ]
    });
  }

  run(message, { userToKick, reason }) {
    const user =
      message.mentions.members.first() || message.guild.members.get(userToKick);
    if (user == undefined)
      return message.channel.send('Please try again with a valid user');
    user
      .kick(reason)
      .then(() => message.say(`Kicked ${userToKick} reason: ${reason}`))
      .catch(e => {
        message.say(
          'Something went wrong when trying to ban this user, I probably do not have the permission to kick him'
        );
        return console.error(e);
      });
  }
};
