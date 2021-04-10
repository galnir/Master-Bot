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
          type: 'string'
        },
        {
          key: 'roleToRemove',
          prompt: 'Which role do you want to remove?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToRemoveRole, roleToRemove }) {
    const getuserid = userToRemoveRole.match(/\d+/g)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(getuserid));
    const role =
      message.mentions.roles.first() ||
      (await message.guild.roles.fetch(roleToRemove));
    if (user == undefined) {
      message.channel.send(':x: Please try again with a valid user.');
      return;
    }
    if (role == undefined) {
      message.channel.send(':x: Please try again with a valid role.');
      return;
    }

    user.roles
      .remove(role)
      .then(() => {
        const rroleEmbed = new MessageEmbed()
          .addField('Removed Role', roleToRemove)
          .addField('From', userToRemoveRole)
          .setColor(role.hexColor);
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
