const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      aliases: ['unmute-user'],
      memberName: 'unmute',
      group: 'guild',
      description: 'Unmutes a tagged user',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToUnmute',
          prompt: 'Please mention the member that you want to unmute them.',
          type: 'member'
        }
      ]
    });
  }

  async run(message, { userToUnmute }) {
    const mutedRole = message.guild.roles.cache.find(
      role => role.name === 'Muted'
    );
    if (!mutedRole)
      return message.channel.send(
        ':x: No "Muted" role was found, create one and try again.'
      );
    const user = userToUnmute;
    if (!user)
      return message.channel.send(':x: Please try again with a valid user.');
    user.roles
      .remove(mutedRole)
      .then(() => {
        const unmuteEmbed = new MessageEmbed()
          .addField('Unmuted:', userToUnmute)
          .setColor('#008000');
        message.channel.send(unmuteEmbed);
      })
      .catch(err => {
        message.reply(
          ':x: Something went wrong when trying to unmute this user.'
        );
        return console.error(err);
      });
  }
};
