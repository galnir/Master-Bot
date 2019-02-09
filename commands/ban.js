const Discord = require("discord.js");
module.exports = {
  name: "ban",
  cooldown: 5,
  description: "bans a user",
  execute(message, args) {
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send("No permission!");
    const bannedUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.get(args[0])
    );
    if (bannedUser.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send("This person is too important to be banned");
    if (!bannedUser) return message.channel.send("Cant find tagged user");
    const bannedReason = args[1];

    const embed = new Discord.MessageEmbed()
      .setDescription("Ban")
      .setColor("#FF0000")
      .addField("Banned User", `${bannedUser} with ID ${bannedUser.id}`)
      .addField(
        "Banned by",
        `<@${message.author.id}> with ID ${message.author.id}`
      )
      .addField("Banned at", message.createdAt)
      .addField("Reason", bannedReason);

    //const bannedChannel = message.guild.channels.find("name", "general");
    //if (!bannedChannel) return message.channel.send("error with the channel");

    message.guild.member(bannedUser).ban(bannedReason);
    message.channel.send(embed);
  }
};
