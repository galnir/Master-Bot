const { Command } = require('discord.js-commando');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
} = require('../../config.json');
const db = require('quick.db');
const TwitchStatusCommand = require('../other/twitchstatus');
const { MessageEmbed } = require('discord.js');

if (twitchClientID == null || twitchClientSecret == null) return;
module.exports = class TwitchAnnouncerSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer-settings',
      memberName: 'twitch-announcer-settings',
      aliases: [
        'twitchannouncesetting',
        'tasetting',
        'tasettings',
        'twitch-announcer-config',
        'twitchannouncerconfig',
        'taconfig'
      ],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'MENTION_EVERYONE'],
      examples: [
        '(Basic Setup)',
        '```' +
          `${prefix}twitch-announcer-settings streamer-name  text-channel-name` +
          '```',
        '(Optional Timer)',
        '```' + `${prefix}tasettings bacon-fixation general 3` + '```',
        `(Optional Message)`,
        '```' +
          `${prefix}tasettings bacon-fixation 2 "Check out my stream"` +
          '```',
        '(Optional No Message)',
        '```' + `${prefix}tasettings bacon-fixation 2 none` + '```'
      ],
      description: 'Settings for the Twitch Announcer.',
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
        },
        {
          key: 'sayMsg',
          prompt:
            '(Optional) Change the default message that comes before the notification.',
          default: 'Hey @everyone',
          type: 'string',
          validate: sayMsg => sayMsg.length > 0
        }
      ]
    });
  }

  async run(message, { textRaw, streamChannel, timer, sayMsg }) {
    try {
      await message.delete();
    } catch {
      return message.reply(
        `:no_entry: Bot needs permission to manage messages in order to use Twitch Announcer Feature`
      );
    }

    let announcedChannel = message.guild.channels.cache.find(
      cchannel => cchannel.name == streamChannel
    );

    if (message.guild.channels.cache.get(streamChannel))
      announcedChannel = message.guild.channels.cache.get(streamChannel);

    if (!announcedChannel)
      return message.reply(':x: ' + streamChannel + ' could not be found.');

    //Twitch Section
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

    //Saving to DB
    var Twitch_DB = new db.table('Twitch_DB');
    Twitch_DB.set(`${message.guild.id}.twitchAnnouncer`, {
      botSay: sayMsg,
      name: user.data[0].display_name,
      channel: announcedChannel.name,
      timer: timer,
      savedName: message.member.displayName,
      savedAvatar: message.author.displayAvatarURL(),
      date: Date.now()
    });

    const DBInfo = Twitch_DB.get(message.guild.id).twitchAnnouncer;

    const embed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Announcer Settings',
        `https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setURL('https://twitch.tv/' + user.data[0].display_name)
      .setTitle(`Your settings were saved!`)
      .setDescription(
        'Remember to run ```' +
          `${prefix}twitch-announcer enable` +
          '``` to start your timer.'
      )
      .setColor('#6441A4')
      .setThumbnail(user.data[0].profile_image_url)
      .addField('Pre-Notification Message', DBInfo.botSay)
      .addField(`Streamer`, DBInfo.name, true)
      .addField(`Channel`, DBInfo.channel, true)
      .addField(`Checking Interval`, `***${DBInfo.timer}*** minute(s)`, true)
      .addField('View Counter:', user.data[0].view_count, true);
    if (user.data[0].broadcaster_type == '')
      embed.addField('Rank:', 'BASE!', true);
    else {
      embed
        .addField(
          'Rank:',
          user.data[0].broadcaster_type.toUpperCase() + '!',
          true
        )
        .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
        .setTimestamp(DBInfo.date);
    }
    message.say(embed);
  }
};
