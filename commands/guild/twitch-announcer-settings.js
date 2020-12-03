const { Command } = require('discord.js-commando');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
} = require('../../config.json');
const db = require('quick.db');
const TwitchStatusCommand = require('../other/twitchstatus');

if (twitchClientID == null || twitchClientSecret == null) return;
module.exports = class TwitchAnnouncerSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer-settings',
      memberName: 'twitch-announcer-settings',
      aliases: [
        'twitch-announcer-config',
        'twitchannouncesetting',
        'taconfig',
        'tasettings'
      ],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['SEND_MESSAGES', 'MENTION_EVERYONE'],
      examples: [
        `${prefix}twitch-announcer-settings Bacon-Fixation general`,
        `${prefix}tasettings bacon-fixation stream-channel 3`
      ],
      description: 'Configures the Twitch announcer command.',
      args: [
        {
          key: 'textRaw',
          prompt: "Who's stream do you want to announce?",
          type: 'string'
        },
        {
          key: 'streamChannel',
          prompt: 'What channel would you like to announce in?',
          type: 'string'
        },
        {
          key: 'timer',
          prompt: '(Optional) How often do you want to check? 1 to 60 Minute',
          type: 'integer',
          default: 2,
          validate: function validate(timer) {
            return timer <= 60 && timer >= 0;
          }
        }
      ]
    });
  }

  async run(message, { textRaw, streamChannel, timer }) {
    let announcedChannel = message.guild.channels.cache.find(
      c => c.name == streamChannel
    );
    if (!announcedChannel)
      return message.reply(':x: ' + streamChannel + ' could not be found.');

    const scope = 'user:read:email';
    const textFiltered = textRaw.replace(/https\:\/\/twitch.tv\//g, '');
    let access_token;
    try {
      access_token = await TwitchStatusCommand.getToken(
        twitchClientID,
        twitchClientSecret,
        scope
      );
    } catch (e) {
      message.say(':x: ' + e);
      return;
    }

    try {
      var user = await TwitchStatusCommand.getUserInfo(
        access_token,
        twitchClientID,
        textFiltered
      );
    } catch (e) {
      message.say(':x: ' + e);
      return;
    }

    var Twitch_DB = new db.table('Twitch_DB');
    Twitch_DB.set(`${message.guild.id}.twitchAnnouncer`, {
      name: user.data[0].display_name,
      channel: streamChannel,
      status: 'enable',
      timer: timer
    });
    message.say(`:white_check_mark: Your settings were saved!
        Streamer: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}***
        Channel: ***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.channel
        }***
        Timer: ***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
        }*** minute(s)`);
  }
};
