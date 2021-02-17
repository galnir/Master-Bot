const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      aliases: ['kick-member', 'throw'],
      memberName: 'kick',
      group: 'guild',
      description: 'Kicks a tagged member.',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToKick',
          prompt:
            'Please mention the user you want to kick with @ or provide his ID.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why do you want to kick this user?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToKick, reason }) {
    const extractNumber = /\d+/g;
    const userToKickID = userToKick.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToKickID));
    if (user == undefined)
      return message.channel.send(':x: Please try again with a valid user.');
    user
      .kick(reason)
      .then(() => {
        const kickEmbed = new MessageEmbed()
          .addField('Kicked:', userToKick)
          .addField('Reason:', reason)
          .setColor('#420626');
        message.channel.send(kickEmbed);
      })
      .catch(err => {
        message.reply(
          ':x: Something went wrong when trying to kick this user, I probably do not have the permission to kick him!'
        );
        return console.error(err);
      });
  }
};
