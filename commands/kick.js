module.exports = {
  name: "kick",
  description: "Tag a member and kick them.",
  cooldown: 5,
  guildOnly: true,
  execute(message) {
    if (
      !message.member.hasPermission([
        "MANAGE_MESSAGES",
        "KICK_MEMBERS",
        "BAN_MEMBERS"
      ])
    )
      return message.channel.send("No permission!");
    const kicker = message.member;
    if (!message.mentions.users.size) {
      return message.reply("you need to tag a user in order to kick them!");
    }
    const taggedUser = message.mentions.users.first();
    if (message.guild.member(taggedUser).hasPermission("MANAGE_MESSAGES")) {
      return message.channel.send("This person is too important to be banned");
    }
    message.guild
      .member(taggedUser)
      .kick()
      .then(guildMember => {
        message.channel.send(`${kicker} kicked ${guildMember.user.username}`);
      })
      .catch(err => {
        console.error(err);
        message.channel.send(
          "Something went wrong when trying to kick this person"
        );
      });
  }
};
