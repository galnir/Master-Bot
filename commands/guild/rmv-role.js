const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class RRCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rr',
      aliases: ['remove-role', 'rr'],
      memberName: 'remove-role',
      group: 'guild',
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      description: 'Removes a specific role from a specified user.',
      guildOnly: true,
      args: [
        {
          key: 'userToRemoveRole',
          prompt: 'To whom do you want to remove role from?',
          type: 'member',
          error: ':x: Please try again with a valid user.'
        },
        {
          key: 'roleToRemove',
          prompt: 'Which role do you want to remove?',
          type: 'role',
          error: ':x: Please try again with a valid role.'
        }
      ]
    });
  }

  async run(message, { userToRemoveRole, roleToRemove }) {
    userToRemoveRole.roles
      .remove(roleToRemove)
      .then(() => {
        const rroleEmbed = new MessageEmbed()
          .addField('Removed Role', roleToRemove)
          .addField('From', userToRemoveRole)
          .setColor(roleToRemove.hexColor);
        message.channel.send(rroleEmbed);
      })
      .then(() => message.delete().catch(e => console.error(e))) // nested promise
      .catch(err => {
        message.reply(
          ':x: Something went wrong when trying to remove Role from this user'
        );
        return console.error(err);
      });
  }
};
