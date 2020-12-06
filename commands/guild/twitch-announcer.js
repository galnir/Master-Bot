const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const TwitchStatusCommand = require('../other/twitchstatus');
const db = require('quick.db');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
} = require('../../config.json');

if (twitchClientID == null || twitchClientSecret == null)
  return console.log(
    `INFO: Twitch Commands removed from the list.\nMake sure you have twitchClientID and twitchClientSecret in your config.json to use Twitch Features`
  );
module.exports = class TwitchAnnouncerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer',
      memberName: 'twitch-announcer',
      aliases: ['twitchannouncer', 'twitchannounce', 'ta'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'MENTION_EVERYONE'],
      examples: [
        '```' + `${prefix}twitch-announcer enable`,
        `${prefix}twitch-announcer disable`,
        `${prefix}ta check` + '```'
      ],
      description:
        'Allows you to ***Enable***, ***Disable*** or ***Check*** the Twitch Announcer.',
      args: [
        {
          key: 'textRaw',
          prompt:
            'Would you like to ***Enable***, ***Disable*** or ***Check*** the Twitch Announcer?',
          type: 'string',
          oneOf: ['enable', 'disable', 'check']
        }
      ]
    });
  }

  async run(message, { textRaw }) {
    var Twitch_DB = new db.table('Twitch_DB');
    var textFiltered = textRaw.toLowerCase();

    //Error Missing DB
    if (Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`) == undefined)
      return message.reply(
        `:no_entry: No Settings were found, Please run ${prefix}twitch-announcer-settings command first`
      );
    message.delete();

    //Get Twitch Ready for Response Embeds
    const scope = 'user:read:email';
    let access_token; // Token is only valid for 24 Hours (needed to repeat this in Ticker Sections)
    let streamInfo;
    let gameInfo;
    try {
      access_token = await TwitchStatusCommand.getToken(
        twitchClientID,
        twitchClientSecret,
        scope
      );
    } catch (e) {
      clearInterval(Ticker);
      message.say(':x: Twitch Announcer Stopped\n' + e);
      return;
    }

    try {
      var user = await TwitchStatusCommand.getUserInfo(
        access_token,
        twitchClientID,
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}`
      );
    } catch (e) {
      clearInterval(Ticker);
      message.say(':x: Twitch Announcer Stopped\n' + e);
      return;
    }

    //Enable Embed
    const enabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Announcer Settings',
        `https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:white_check_mark: Twitch Announcer Enabled!`)
      .setColor('#6441A4')
      .setThumbnail(user.data[0].profile_image_url)
      .addField(
        'Pre-Notification Message',
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.botSay}`
      )
      .addField(
        `Streamer`,
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}`,
        true
      )
      .addField(
        `Channel`,
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.channel}`,
        true
      )
      .addField(
        `Checking Interval`,
        `***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
        }*** minute(s)`,
        true
      )
      .addField('View Counter:', user.data[0].view_count, true);
    if (user.data[0].broadcaster_type == '')
      enabledEmbed.addField('Rank:', 'BASE!', true);
    else {
      enabledEmbed
        .addField(
          'Rank:',
          user.data[0].broadcaster_type.toUpperCase() + '!',
          true
        )
        .setFooter(
          Twitch_DB.get(message.guild.id).twitchAnnouncer.savedName,
          Twitch_DB.get(message.guild.id).twitchAnnouncer.savedAvatar
        )
        .setTimestamp(Twitch_DB.get(message.guild.id).twitchAnnouncer.date);
    }

    //Disable Embed
    const disabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Announcer Settings',
        `https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:x: Twitch Announcer Disabled!`)
      .setColor('#6441A4')
      .setThumbnail(user.data[0].profile_image_url)
      .addField(
        'Pre-Notification Message',
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.botSay}`
      )
      .addField(
        `Streamer`,
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}`,
        true
      )
      .addField(
        `Channel`,
        `${Twitch_DB.get(message.guild.id).twitchAnnouncer.channel}`,
        true
      )
      .addField(
        `Checking Interval`,
        `***${
          Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
        }*** minute(s)`,
        true
      )
      .addField('View Counter:', user.data[0].view_count, true);
    if (user.data[0].broadcaster_type == '')
      disabledEmbed.addField('Rank:', 'BASE!', true);
    else {
      disabledEmbed
        .addField(
          'Rank:',
          user.data[0].broadcaster_type.toUpperCase() + '!',
          true
        )
        .setFooter(
          Twitch_DB.get(message.guild.id).twitchAnnouncer.savedName,
          Twitch_DB.get(message.guild.id).twitchAnnouncer.savedAvatar
        )
        .setTimestamp(Twitch_DB.get(message.guild.id).twitchAnnouncer.date);
    }
    //Check Post
    if (textFiltered == 'check') {
      if (Twitch_DB.get(message.guild.id).twitchAnnouncer.status == 'disable')
        message.say(disabledEmbed);
      else {
        return message.say(enabledEmbed);
      }
      return;
    }
    //Disable Set
    if (textFiltered == 'disable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'disable');
      message.say(disabledEmbed);
    }

    //Enable Set
    if (textFiltered == 'enable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'enable');
      message.say(enabledEmbed);

      //Ticker Section (Loop)
      var Ticker = setInterval(async function() {
        let statusCheck = Twitch_DB.get(message.guild.id).twitchAnnouncer
          .status;
        if (statusCheck == 'disable') {
          clearInterval(Ticker);
          return;
        }

        let announcedChannel = message.guild.channels.cache.find(
          c => c.name == Twitch_DB.get(message.guild.id).twitchAnnouncer.channel
        );
        try {
          access_token = await TwitchStatusCommand.getToken(
            twitchClientID,
            twitchClientSecret,
            scope
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(':x: Twitch Announcer Stopped\n' + e);
          return;
        }

        try {
          user = await TwitchStatusCommand.getUserInfo(
            access_token,
            twitchClientID,
            `${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}`
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(':x: Twitch Announcer Stopped\n' + e);
          return;
        }

        var user_id = user.data[0].id;
        try {
          streamInfo = await TwitchStatusCommand.getStream(
            access_token,
            twitchClientID,
            user_id
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(':x: Twitch Announcer Stopped\n' + e);
          return;
        }

        //Offline Status Set
        if (!streamInfo.data[0] && statusCheck != 'end') {
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.status`,
            'offline'
          );
        }

        //Online Status set
        if (statusCheck != 'sent' && streamInfo.data[0]) {
          Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'online');
        }

        //Online Trigger
        if (statusCheck == 'online') {
          Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'sent');
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.gameName`,
            streamInfo.data[0].game_name
          );
          try {
            gameInfo = await TwitchStatusCommand.getGames(
              access_token,
              twitchClientID,
              streamInfo.data[0].game_id
            );
          } catch (e) {
            clearInterval(Ticker);
            message.say(':x: Twitch Announcer Stopped\n' + e);
            return;
          }

          //Online Embed
          const onlineEmbed = new MessageEmbed()
            .setAuthor(
              'Twitch Announcement',
              user.data[0].profile_image_url,
              'https://twitch.tv/' + user.data[0].display_name
            )
            .setURL('https://twitch.tv/' + user.data[0].display_name)
            .setTitle(
              'Looks like ' + user.data[0].display_name + ' is: Online!'
            )
            .addField('Stream Title:', streamInfo.data[0].title)
            .addField('Currently Playing:', streamInfo.data[0].game_name, true)
            .addField('Viewers:', streamInfo.data[0].viewer_count, true)
            .setColor('#6441A4')
            .setFooter(
              'Stream Started',
              'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png' // Official icon link from Twitch.tv
            )
            .setImage(
              streamInfo.data[0].thumbnail_url
                .replace(/{width}x{height}/g, '1280x720')
                .concat('?r=' + Math.floor(Math.random() * 10000 + 1)) // to ensure the image updates when refreshed
            )
            .setThumbnail(user.data[0].profile_image_url)
            .setTimestamp(streamInfo.data[0].started_at);
          if (user.data[0].broadcaster_type == '')
            onlineEmbed.addField('Rank:', 'BASE!', true);
          else {
            onlineEmbed.addField(
              'Rank:',
              user.data[0].broadcaster_type.toUpperCase() + '!',
              true
            );
          }

          //Online Send
          if (
            Twitch_DB.get(
              `${message.guild.id}.twitchAnnouncer.botSay`
            ).toLowerCase() != 'none'
          ) {
            announcedChannel.message.say(
              Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.botSay`)
            ),
              announcedChannel.send(onlineEmbed);
          } else {
            announcedChannel.send(onlineEmbed);
          }
        }

        //Game Change Trigger
        if (
          streamInfo.data[0] &&
          streamInfo.data[0].game_name !=
            Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.gameName`) &&
          statusCheck == 'sent'
        ) {
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.gameName`,
            streamInfo.data[0].game_name
          );
          try {
            gameInfo = await TwitchStatusCommand.getGames(
              access_token,
              twitchClientID,
              streamInfo.data[0].game_id
            );
          } catch (e) {
            clearInterval(Ticker);
            message.say(':x: Twitch Announcer Stopped\n' + e);
            return;
          }

          //Game Change Embed
          const changedEmbed = new MessageEmbed()
            .setAuthor(
              'Twitch Announcement',
              user.data[0].profile_image_url,
              'https://twitch.tv/' + user.data[0].display_name
            )
            .setURL('https://twitch.tv/' + user.data[0].display_name)
            .setTitle(
              'Looks like ' + user.data[0].display_name + ': Changed Games!'
            )
            .addField('Stream Title:', streamInfo.data[0].title)
            .addField('Currently Playing:', streamInfo.data[0].game_name, true)
            .addField('Viewers:', streamInfo.data[0].viewer_count, true)
            .setColor('#6441A4')
            .setFooter(
              'Changed Game',
              'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png' // Official icon link from Twitch.tv
            )
            .setImage(
              streamInfo.data[0].thumbnail_url
                .replace(/{width}x{height}/g, '1280x720')
                .concat('?r=' + Math.floor(Math.random() * 10000 + 1)) // to ensure the image updates when refreshed
            )
            .setThumbnail(user.data[0].profile_image_url)
            .setTimestamp();
          if (user.data[0].broadcaster_type == '')
            changedEmbed.addField('Rank:', 'BASE!', true);
          else {
            changedEmbed.addField(
              'Rank:',
              user.data[0].broadcaster_type.toUpperCase() + '!',
              true
            );
          }

          //Game Change Edit Attempt
          try {
            await announcedChannel.lastMessage.edit(changedEmbed);
          } catch {
            return;
          }
        }

        //Offline Edit
        if (statusCheck == 'offline') {
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.status`,
            'offline'
          );
          const offlineEmbed = new MessageEmbed()
            .setAuthor('Streamer ', user.data[0].profile_image_url)
            .setURL('https://twitch.tv/' + user.data[0].display_name)
            .setTitle(
              'Looks like ' + user.data[0].display_name + ' is: Offline.'
            )
            .setColor('#6441A4')
            .setTimestamp()
            .setFooter(
              'Stream Ended',
              'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png'
            )
            .setThumbnail(user.data[0].profile_image_url);

          if (!user.data[0].description == '')
            offlineEmbed
              .addField('Profile Description:', user.data[0].description)

              .addField('View Counter:', user.data[0].view_count, true);
          if (user.data[0].broadcaster_type == '')
            offlineEmbed.addField('Rank:', 'BASE!', true);
          else {
            offlineEmbed.addField(
              'Rank:',
              user.data[0].broadcaster_type.toUpperCase() + '!',
              true
            );
          }

          //Offline Edit Attempt
          try {
            await announcedChannel.lastMessage.edit(offlineEmbed);
            return Twitch_DB.set(
              `${message.guild.id}.twitchAnnouncer.status`,
              'end'
            );
          } catch {
            return;
          }
        }
      }, Twitch_DB.get(message.guild.id).twitchAnnouncer.timer * 60000);
    }
  }
};
