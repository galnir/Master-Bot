const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      aliases: ['make-me-say', 'print'],
      memberName: 'say',
      group: 'other',
      clientPermissions: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
      description: 'Make the bot say anything!',
      args: [
        {
          key: 'announcementChannel',
          prompt: 'In which channel do you want the announcement to be sent?',
          type: 'channel',
          default: message => message.channel.id
        },
        {
          key: 'text',
          prompt: ':microphone2: What do you want the bot to say?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { text, announcementChannel }) {
    const embed = new MessageEmbed()
      .setTitle(`Just wanted to say...`)
      .setColor('#888888')
      .setDescription(text)
      .setTimestamp()
      .setFooter(
        `${message.member.displayName}, made me say it!`,
        message.author.displayAvatarURL()
      );
    
    if (announcementChannel != undefined) {
      let announcedChannel = message.guild.channels.cache.find(
        channel => channel.name == announcementChannel
      );

      if (message.guild.channels.cache.get(announcementChannel)) {
        announcedChannel = message.guild.channels.cache.get(announcementChannel);
      }

      if (!announcedChannel) {
        message.reply(':x: ' + announcementChannel + ' could not be found.');
        return;
      }
      
      announcedChannel
        .send(embed)
        .catch(e => console.log(e));
      return;
    } else if (announcementChannel) {
      message.channel
        .send(embed)
        .then(
        () => message.delete().catch(e => console.error(e)) // nested promise
      )
        .catch(e => console.error(e));
      return;
    }
  }
};
