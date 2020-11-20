const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      aliases: ['mute-user'],
      memberName: 'mute',
      group: 'guild',
      description:
        'Mutes a tagged user (if you have already created a Muted role)',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToMute',
          prompt:
            'Please mention the user you want to mute with @ or provide their ID.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why do you want to mute this user?',
          type: 'string',
          default: 'no reason'
        }
      ]
    });
  }

  async run(message, { userToMute, reason }) {
    const mutedRole = message.guild.roles.cache.find(
      role => role.name === 'Muted'
    );
    if (mutedRole == null)
      return message.channel.send(
        ':x: No "Muted" role found create one and try again.'
      );

    const extractNumber = /\d+/g;

    if (userToMute.match(extractNumber) == undefined)
      return message.channel.send(':x: Please try again with a valid user.');

    const userToMuteID = userToMute.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToMuteID));
    if (user == undefined)
      return message.channel.send(':x: Please try again with a valid user.');
    user.roles
      .add(mutedRole)
      .then(() => {
        const muteEmbed = new MessageEmbed()
          .addField('Muted:', userToMute)
          .addField('Reason', reason)
          .setColor('#420626');
        message.channel.send(muteEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Something went wrong when trying to mute this user.'
        );
        return console.error(err);
      });
  }
};
