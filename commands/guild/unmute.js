const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      aliases: ['unmute-user'],
      memberName: 'unmute',
      group: 'guild',
      description:
        'Unmutes a tagged user',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToUnmute',
          prompt:
            'Please mention the user you want to unmute with @ or provide their ID.',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToUnmute }) {
    const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (mutedRole == null)
      return message.channel.send(
        ':x: No "Muted" role was found, create one and try again.'
      );

    const extractNumber = /\d+/g;

    if (userToUnmute.match(extractNumber) == undefined)
      return message.channel.send(':x: Please try again with a valid user.');

    const userToUnmuteID = userToUnmute.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToUnmuteID));
    if (user == undefined)
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
        message.say(
          ':x: Something went wrong when trying to unmute this user.'
        );
        return console.error(err);
      });
  }
};
