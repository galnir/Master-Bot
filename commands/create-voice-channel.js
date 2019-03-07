module.exports = {
  name: 'create-voice-channel',
  cooldown: 5,
  description: 'Create a voice channel',
  execute(message, args) {
    if (!message.guild) return;
    // check if user is an admin
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
      return message.reply('You have no permission to create channels!');
    // check if provided args
    if (!args) return message.reply('Please provide a channel name!');
    // stringify the args
    const channelName = args.toString();
    // no more than 20 characters
    if (channelName.length > 20)
      return message.reply('Channel names need to be less than 20 characters');
    message.guild.channels
      .create(channelName, {
        type: 'voice'
      })
      .then(
        message.channel.send(
          `Created a new voice channel named ${channelName.toLowerCase()}`
        )
      )
      .catch(e => {
        console.log(e);
        return message.channel.send(
          'An error has occured when trying to create a voice channel'
        );
      });
  }
};
