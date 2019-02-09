module.exports = {
  name: "create-text-channel",
  cooldown: 5,
  description: "Create a text channel",
  execute(message, args) {
    if (!message.guild) return;
    // check if user is an admin
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.reply("You have no permission to create channels!");
    // check if provided args
    if (!args) return message.reply("Please provide a channel name!");
    // stringify the args
    const channelName = args.toString();
    // no more than 20 characters
    if (channelName.length > 20)
      return message.reply("Channel names need to be less than 20 characters");
    message.guild.channels
      .create(channelName, {
        type: "text"
      })
      .then(
        message.channel.send(
          `Created a new text channel named ${channelName.toLowerCase()}`
        )
      )
      .catch(e => {
        message.channel.send(
          "An error has occured when trying to create a text channel"
        );
        console.log(e);
      });
  }
};
