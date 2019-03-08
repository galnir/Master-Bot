const { Command } = require('discord.js-commando');

module.exports = class CreateVoiceChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-voice-channel',
      aliases: ['create-voice', 'voice-channel'],
      memberName: 'create-voice-channel',
      group: 'guild',
      description: 'Creates a new voice channel',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS'],
      args: [
        {
          key: 'channelName',
          prompt:
            'What is the name of the voice channel that you want to create?',
          type: 'string',
          validate: channelName => channelName.length < 50
        }
      ]
    });
  }

  run(message, { channelName }) {
    message.guild.channels
      .create(channelName, {
        type: 'voice'
      })
      .then(
        message.say(
          `Created a new voice channel named ${channelName.toLowerCase()}`
        )
      )
      .catch(e => {
        console.error(e);
        return message.say(
          'An error has occured when trying to create a voice channel'
        );
      });
  }
};
