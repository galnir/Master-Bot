const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban-member', 'ban-hammer'],
      memberName: 'ban',
      group: 'guild',
      description: 'Bans a tagged member.',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToBan',
          prompt:
            'Please mention the user you want to ban with @ or provide his ID.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Why do you want to ban this user?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToBan, reason }) {
    const extractNumber = /\d+/g;
    const userToBanID = userToBan.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToBanID));
    if (user == undefined)
      return message.channel.send(':x: Please try again with a valid user.');
    user
      .ban(reason)
      .then(() => {
        const banEmbed = new MessageEmbed()
          .addField('Banned:', userToBan)
          .addField('Reason', reason)
          .setColor('#420626');
        message.channel.send(banEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Something went wrong when trying to ban this user, I probably do not have the permission to ban him!'
        );
        return console.error(err);
      });
  }
};
