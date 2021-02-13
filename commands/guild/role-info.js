const { MessageEmbed } = require('discord.js');
const {
  Command,
  util: { permissions }
} = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class RoleInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'role-info',
      group: 'guild',
      memberName: 'role-info',
      description: 'Detailed information on a role & who has it',
      guildOnly: true,
      args: [
        {
          key: 'role',
          prompt: 'Which role would you like to get information?',
          type: 'role',
          error: `Role was not found, please try again.`
        }
      ]
    });
  }

  run(message, { role }) {
    const serialized = role.permissions.serialize();
    const permList = Object.keys(permissions).filter(perm => serialized[perm]);
    const memberList = role.members;

    const embedArray = [
      //Page 1 (Basic Info)
      new MessageEmbed()
        .addField('Role', `<@&${role.id}>`)
        .addField('Role ID', role.id)
        .addField('Color', role.hexColor.toUpperCase())
        .addField('Creation Date', new Date(role.createdAt).toDateString())
        .addField('Mentionable', role.mentionable ? 'Yes' : 'No')
        .setFooter('▶️ Permissions')
    ];
    // Page 2 (Permissions List)
    embedArray.push(
      new MessageEmbed()
        .setDescription(
          `**<@&${role.id}> Permissions**\n` +
            permList.map(perm => permissions[perm]).join('\n') || 'None'
        )
        .setFooter('◀️ Basic Info | ▶️ Members')
    );
    // Page 3 (Member List)
    embedArray.push(
      new MessageEmbed()
        .setDescription(
          `**<@&${role.id}> Members**\n` +
            memberList.map(role => role.user.username).join(', ') || 'None'
        )
        .setFooter('◀️ Permissions')
    );

    new Pagination.Embeds()
      .setArray(embedArray)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setTitle(`Server: ${message.guild.name}`)
      .setThumbnail(message.guild.iconURL({ format: 'png' }))
      .setColor(role.hexColor)
      .build();
  }
};
