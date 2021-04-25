const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ARCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ar',
      aliases: ['assign-role', 'ar', 'add-role'],
      memberName: 'assign-role',
      group: 'guild',
      clientPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      description: 'Adds a specific role to a specified user.',
      guildOnly: true,
      args: [
        {
          key: 'userToAssignRole',
          prompt: 'To whom do you want to add role?',
          type: 'member',
          error: ':x: Please try again with a valid user.'
        },
        {
          key: 'roleToAssign',
          prompt: 'Which role do you want to assign?',
          type: 'role',
          error: ':x: Please try again with a valid role.'
        }
      ]
    });
  }

  run(message, { userToAssignRole, roleToAssign }) {
    if (userToAssignRole._roles.includes(roleToAssign.id)) {
      return message.channel.send(
        `:x: "**${userToAssignRole.displayName}**" already has the "**${roleToAssign.name}**" role.`
      );
    }

    userToAssignRole.roles
      .add(roleToAssign)
      .then(() => {
        const roleEmbed = new MessageEmbed()
          .addField('Assigned Role', roleToAssign)
          .addField('To', userToAssignRole)
          .setColor(roleToAssign.hexColor);
        message.channel.send(roleEmbed);
      })
      .then(() => message.delete().catch(e => console.error(e))) // nested promise
      .catch(err => {
        message.reply(
          ':x: Something went wrong when trying to assign role to this user'
        );
        return console.error(err);
      });
  }
};
