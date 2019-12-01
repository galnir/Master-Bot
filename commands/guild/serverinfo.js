 const { Command } = require('discord.js-commando');
 const { Discord } = require('discord.js');
 const { MessageEmbed } = require('discord.js');
 
 module.exports = class ServerinfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server', 'infoserver'],
      memberName: 'serverinfo',
      group: 'guild',
      description: "Replies with the current server's info."
    });
  }
 run(message) {
 let verifLevels = ["None", "Low", "Medium", "(╯°□°）╯︵  ┻━┻", "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"];
    let region = {
        "brazil": "Brazil",
        "eu-central": "Central Europe",
        "singapore": "Singapore",
        "us-central": "U.S. Central",
        "sydney": "Sydney",
        "us-east": "U.S. East",
        "us-south": "U.S. South",
        "us-west": "U.S. West",
        "eu-west": "Western Europe",
        "vip-us-east": "VIP U.S. East",
        "london": "London",
        "amsterdam": "Amsterdam",
        "hongkong": "Hong Kong"
    };
    
    var emojis;
    if (message.guild.emojis.size === 0) {
        emojis = 'None';
    } else {
        emojis = message.guild.emojis.size;
    }

    const serverinfoEmbed = new MessageEmbed()
  .setAuthor(message.guild.name, message.guild.iconURL ? message.guild.iconURL : client.user.displayAvatarURL)
  .setThumbnail(message.guild.iconURL)
  .setTimestamp()
  .addField("Created", `${message.guild.createdAt.toString().substr(0, 15)}`, true)
  .addField("ID", message.guild.id, true)
  .addField("Owner", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`, true)
  .addField("Region", region[message.guild.region], true)
  .addField("User Count", message.guild.memberCount, true)
  .addField("Member Count", message.guild.members.filter(m => !m.user.bot).size, true)
  .addField("Bot Count", message.guild.members.filter(m => m.user.bot).size, true)
  .addField("AFK Timeout", message.guild.afkTimeout / 60 + ' minutes', true)
  .addField("Roles", message.guild.roles.size, true)
  .addField("Channels", message.guild.channels.size, true)
  .addField("Emojis", `${emojis}/100`, true)
  .addField("Verification Level", verifLevels[message.guild.verificationLevel], true)
  .setColor(Math.floor(Math.random()*16777215))
  .setFooter(`© Crystal, crystalbot.xyz`);
  message.channel.send(serverinfoEmbed);
}
 };
