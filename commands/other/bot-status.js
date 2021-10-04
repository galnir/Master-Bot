const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const os = require('os');
const pkg = require('../../package.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot-status')
    .setDescription('Shows the current system status'),
  async execute(interaction) {
    const owner = await interaction.guild.fetchOwner();
    const isOwner = owner.id == interaction.member.id ? true : false;

    const pingMsg = await interaction.channel.send('Processing...');

    const commandTotal = interaction.client.commands.size;
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
      .replace(/github\:discordjs\/discord.js#master/, `${Discord.version}`)
      .replace(/:/g, ': ');

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    let totalSeconds = process.uptime();
    let realTotalSecs = Math.floor(totalSeconds % 60);
    let days = Math.floor((totalSeconds % 31536000) / 86400);
    let hours = Math.floor((totalSeconds / 3600) % 24);
    let mins = Math.floor((totalSeconds / 60) % 60);

    const guildCacheMap = interaction.client.guilds.cache;
    const guildCacheArray = Array.from(guildCacheMap, ([name, value]) => ({
      name,
      value
    }));
    let memberCount = 0;
    for (let i = 0; i < guildCacheArray.length; i++) {
      memberCount = memberCount + guildCacheArray[i].value.memberCount;
    }

    await pingMsg.edit('Complete');

    const StatusEmbed = new Discord.MessageEmbed()
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTitle(`Status of ${interaction.client.user.username}`)
      .setColor('#ff0000');

    if (isOwner) {
      StatusEmbed.addField(
        `Memory Usage`,
        `${Math.round(used * 100) / 100}MB`,
        true
      ).addField(`Platform`, `${platform} ${archInfo}`, true);
    }

    StatusEmbed.addField(
      'Ping',
      `Round-trip took ${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) -
        interaction.createdTimestamp}ms.
			${
        interaction.client.ws.ping
          ? `The heartbeat ping is ${Math.round(interaction.client.ws.ping)}ms.`
          : ''
      }`
    )
      .addField(
        `Uptime`,
        `${days} D ${hours} H : ${mins} M : ${realTotalSecs} S`
      )
      .addField('Available Commands', `${commandTotal} Commands Available`)
      .addField(
        'Servers, Users',
        `On ${interaction.client.guilds.cache.size} servers, with a total of ${memberCount} users.`
      )

      .setFooter('Created', interaction.client.user.avatarURL())
      .setTimestamp(interaction.client.user.createdAt);

    if (isOwner)
      StatusEmbed.addField(
        'Dependency List',
        `node: ${process.version.replace(/v/, '')}
        ${libList}`
      );

    interaction.reply({ embeds: [StatusEmbed] });
    await pingMsg.delete();
  }
};
