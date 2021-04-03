const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class ARCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ar',
      aliases: ['assign-role', 'ar'],
      memberName: 'assign-role',
      group: 'guild',
      description: 'Adds a specific role to a specified user.',
      guildOnly: true,
      ownerOnly: true,
      args: [
        {
          key: 'userToAssignRole',
          prompt: 'To whom do you want to add role?',
          type: 'string'
        },
        {
          key: 'roleToAssign',
          prompt: 'Which role do you want to assign?',
          type: 'string'
        }
        ]
    });
  }
  
  async run( message, { userToAssignRole, roleToAssign }) {
    const extractNumber = /\d+/g;
    const getuserid = userToAssignRole.match(extractNumber)[0];
    const user = 
          message.mentions.members.first() || 
          (await message.guild.members.fetch(getuserid));
    const role = message.mentions.roles.first() || 
          (await message.guild.roles.fetch(roleToAssign));
    if (user == undefined)
      return message.channel.send(':x: Please try again with a valid user.');
    if (role == undefined)
      return message.channel.send(':x: Please try again with a valid role.');
    
    user.roles
      .add(role)
      .then(() => {
        const aroleEmbed = new MessageEmbed()
          .addField('Assigned Role', roleToAssign)
          .addField('To', userToAssignRole)
          .setColor(role.hexColor);
        message.channel.send(aroleEmbed);
      })
      .then( () => message.delete().catch(e => console.error(e)) ) // nested promise
      .catch(err => {
        message.reply(
          ':x: Something went wrong when trying to assign role to this user, I probably do not have the permission to assign role to him!'
        );
        return console.error(err);
      });
  }
};
