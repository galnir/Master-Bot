const { Command, version } = require('discord.js-commando');
const Discord = require('discord.js');
const os = require('os');
const pkg = require('../../package.json');

module.exports = class BotStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bot-status',
      group: 'other',
      memberName: 'bot-status',
      description: 'Shows the current system status'
    });
  }

  run(message) {
    const commandTotal = this.client.registry.commands.keyArray();
    const platform = os
      .platform()
      .replace(/win32/, 'Windows')
      .replace(/darwin/, 'MacOS')
      .replace(/linux/, 'Linux');
    const archInfo = os.arch();
    const libList = JSON.stringify(pkg.dependencies)
      .replace(/,/g, '\n')
      .replace(/"/g, '')
      .replace(/{/g, '')
      .replace(/}/g, '')
      .replace(/\^/g, '')
      .replace(/github\:discordjs\/Commando/, `${version}`)
      .replace(/github\:discordjs\/discord.js#stable/, `${Discord.version}`)
      .replace(/:/g, ': ');
    //console.log(discord);

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    let totalSeconds = process.uptime();
    let realTotalSecs = Math.floor(totalSeconds % 60);
    let days = Math.floor((totalSeconds % 31536000) / 86400);
    let hours = Math.floor((totalSeconds / 3600) % 24);
    let mins = Math.floor((totalSeconds / 60) % 60);

    const StatusEmbed = new Discord.MessageEmbed()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setTitle(`Status of ${this.client.user.username}`)
      .setColor('#ff0000')
      .addField(`Memory usage`, `${Math.round(used * 100) / 100}MB`, true)
      .addField(
        `Uptime`,
        `${days} D 
         ${hours} H : ${mins} M : ${realTotalSecs} S`,
        true
      )
      .addField(`Platform`, `${platform} ${archInfo}`, true)
      .addField('Operated By', this.client.owners)

      .addField(
        'Available Commands',
        `${commandTotal.length} Commands Available`,
        true
      )
      .addField(
        'Servers, Users',
        `On ${this.client.guilds.cache.size} servers, with a total of ${this.client.users.cache.size} users.`
      )
      .addField(
        'Dependency List',
        `node: ${process.version.replace(/v/, '')}
        ${libList}`
      )
      .setFooter('Created', this.client.user.avatarURL())
      .setTimestamp(this.client.user.createdAt);

    message.channel.send(StatusEmbed);
  }
};
