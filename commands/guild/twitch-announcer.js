const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const db = require('quick.db');
const TwitchAPI = require('../../resources/twitch/twitch-api.js');
const probe = require('probe-image-size');
const Canvas = require('canvas');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
} = require('../../config.json');

// Skips loading if not found in config.json
if (!twitchClientID || !twitchClientSecret) return;
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
    // Grab DataBase 1 get
    var Twitch_DB = new db.table('Twitch_DB');
    const DBInfo = Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`);

    var textFiltered = textRaw.toLowerCase();
    var currentMsgStatus;
    var currentGame;
    var embedID;

    //Error Missing DB
    if (DBInfo == undefined) {
      message.reply(
        ':no_entry: No settings were found, please run `' +
          `${prefix}twitch-announcer-settings` +
          '` first'
      );
      return;
    }

    try {
      var user = await TwitchAPI.getUserInfo(
        TwitchAPI.access_token,
        twitchClientID,
        `${DBInfo.name}`
      );
    } catch (e) {
      message.reply(':x: Twitch Announcer has stopped!\n' + e);
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
      .addField('Pre-Notification Message', `${DBInfo.botSay}`)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField(`Checking Interval`, `***${DBInfo.timer}*** minute(s)`, true)
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
        .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
        .setTimestamp(DBInfo.date);
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
      .addField('Pre-Notification Message', `${DBInfo.botSay}`)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField(`Checking Interval`, `***${DBInfo.timer}*** minute(s)`, true)
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
        .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
        .setTimestamp(DBInfo.date);
    }

    //Check embed trigger
    if (textFiltered == 'check') {
      if (currentMsgStatus == 'disable') {
        message.channel.send(disabledEmbed);
      } else {
        message.channel.send(enabledEmbed);
      }
      return;
    }

    //Enable Set
    if (textFiltered == 'enable') {
      currentMsgStatus = 'enable';
      enabled();
      message.channel.send(enabledEmbed);
    }
    //Disable Set
    if (textFiltered == 'disable') {
      disable();
      message.channel.send(disabledEmbed);
    }

    //Ticker Section (Loop)
    function enabled() {
      message.guild.twitchData.Interval = setInterval(async function() {
        await announcer();
      }, DBInfo.timer * 60000); //setInterval() is in MS and needs to be converted to minutes
    }

    async function announcer() {
      const announcedChannel = message.guild.channels.cache.find(
        channel => channel.id == DBInfo.channelID
      );
      try {
        var streamInfo = await TwitchAPI.getStream(
          TwitchAPI.access_token,
          twitchClientID,
          DBInfo.id
        );
      } catch (e) {
        message.guild.twitchData.Interval = clearInterval(
          message.guild.twitchData.Interval
        );
        message.reply(':x: Twitch Announcer has stopped!\n' + e);
        return;
      }

      //Offline Status Set
      if (!streamInfo.data[0] && currentMsgStatus == 'sent') {
        currentMsgStatus = 'offline';
      }
      //Online Status set
      if (
        currentMsgStatus != 'sent' &&
        streamInfo.data[0] &&
        currentMsgStatus != 'disable'
      ) {
        currentMsgStatus = 'online';
      }

      //Online Trigger
      if (currentMsgStatus == 'online') {
        currentGame = streamInfo.data[0].game_name;

        try {
          var gameInfo = await TwitchAPI.getGames(
            TwitchAPI.access_token,
            twitchClientID,
            streamInfo.data[0].game_id
          );

          var result = await probe(
            gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
          );
          var canvas = Canvas.createCanvas(result.width, result.height);
          var ctx = canvas.getContext('2d');
          // Since the image takes time to load, you should await it
          var background = await Canvas.loadImage(
            gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
          );
          // This uses the canvas dimensions to stretch the image onto the entire canvas
          ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
          // Use helpful Attachment class structure to process the file for you
          var attachment = new MessageAttachment(
            canvas.toBuffer(),
            'box_art.png'
          );
        } catch (e) {
          message.guild.twitchData.Interval = clearInterval(
            message.guild.twitchData.Interval
          );
          message.reply(':x: Twitch Announcer has stopped!\n' + e);
          return;
        }

        //Online Embed
        const onlineEmbed = new MessageEmbed()
          .setAuthor(
            `Twitch Announcement: ${user.data[0].display_name} Online!`,
            user.data[0].profile_image_url,
            'https://twitch.tv/' + user.data[0].display_name
          )
          .setURL('https://twitch.tv/' + user.data[0].display_name)
          .setTitle(user.data[0].display_name + ' is playing ' + currentGame)
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
          .setTimestamp(streamInfo.data[0].started_at)
          .attachFiles(attachment)
          .setThumbnail('attachment://box_art.png');

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
        try {
          if (DBInfo.botSay.toLowerCase() != 'none') {
            await announcedChannel.send(DBInfo.botSay),
              await announcedChannel.send(onlineEmbed);
            embedID = announcedChannel.lastMessage.id;
          } else {
            await announcedChannel.send(onlineEmbed);
            embedID = announcedChannel.lastMessage.id;
          }
        } catch (error) {
          message.reply(':x: Could not send message to channel');
          console.log(error);
          message.guild.twitchData.Interval = clearInterval(
            message.guild.twitchData.Interval
          );
          return;
        }
        currentMsgStatus = 'sent';
      }

      //Offline Trigger
      if (currentMsgStatus == 'offline') {
        currentMsgStatus = 'end';
        const offlineEmbed = new MessageEmbed()
          .setAuthor(
            `Twitch Announcement: ${user.data[0].display_name} Offline`,
            user.data[0].profile_image_url,
            'https://twitch.tv/' + user.data[0].display_name
          )
          .setTitle(user.data[0].display_name + ' was playing ' + currentGame)
          .setColor('#6441A4')
          .setTimestamp()
          .setFooter(
            'Stream Ended',
            'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png'
          )
          .setThumbnail('attachment://box_art.png');

        // Incase the there is no Profile Description
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

        //Offline Edit
        try {
          await announcedChannel.messages
            .fetch({
              around: embedID,
              limit: 1
            })
            .then(msg => {
              const fetchedMsg = msg.first();
              fetchedMsg.edit(offlineEmbed);
            });
        } catch (error) {
          message.reply(':x: Could not edit message');
          console.log(error);
          message.guild.twitchData.Interval = clearInterval(
            message.guild.twitchData.Interval
          );
          return;
        }
      }
    }

    function disable() {
      message.guild.twitchData.Interval = clearInterval(
        message.guild.twitchData.Interval
      );
    }
  }
};
