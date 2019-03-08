const { Command } = require('discord.js-commando');

module.exports = class CreateTextChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-text-channel',
      aliases: ['create-channel-text', 'text-channel'],
      memberName: 'create-text-channel',
      group: 'guild',
      description: 'Creates a text channel',
      userPermissions: ['MANAGE_CHANNELS'],
      guildOnly: true,
      args: [
        {
          key: 'channelName',
          prompt: 'What is the name of the channel that you want to create?',
          type: 'string',
          validate: channelName => channelName.length < 50
        }
      ]
    });
  }

  run(message, { channelName }) {
    message.guild.channels
      .create(channelName, { type: 'text' })
      .then(message.say(`Created a new text channel named ${channelName}`))
      .catch(e => {
        console.error(e);
        return message.say(
          'An error has occured when trying to create a channel'
        );
      });
  }
};
