const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const TwitchStatusCommand = require('../other/twitchstatus');
const db = require('quick.db');
const probe = require('probe-image-size');
const Canvas = require('canvas');
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
    const DBInfo = Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`);
    var currentMsgStatus;
    var currentGame;

    //Error Missing DB
    if (DBInfo == undefined)
      return message.reply(
        ':no_entry: No settings were found, please run `' +
          `${prefix}twitch-announcer-settings` +
          '` first'
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
      message.say(':x: Twitch Announcer has stopped!\n' + e);
      return;
    }

    try {
      var user = await TwitchStatusCommand.getUserInfo(
        access_token,
        twitchClientID,
        `${DBInfo.name}`
      );
    } catch (e) {
      clearInterval(Ticker);
      message.say(':x: Twitch Announcer has stopped!\n' + e);
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
    //Check Post
    if (textFiltered == 'check') {
      if (currentMsgStatus == 'disable') message.say(disabledEmbed);
      else {
        return message.say(enabledEmbed);
      }
      return;
    }
    //Disable Set
    if (textFiltered == 'disable') {
      currentMsgStatus = 'disable';
      message.say(disabledEmbed);
    }

    //Enable Set
    if (textFiltered == 'enable') {
      currentMsgStatus = 'enable';
      message.say(enabledEmbed);

      //Ticker Section (Loop)
      var Ticker = setInterval(async function() {
        if (currentMsgStatus == 'disable') {
          clearInterval(Ticker);
          return;
        }

        let announcedChannel = message.guild.channels.cache.find(
          channel => channel.name == DBInfo.channel
        );
        try {
          access_token = await TwitchStatusCommand.getToken(
            twitchClientID,
            twitchClientSecret,
            scope
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(':x: Twitch Announcer has stopped!\n' + e);
          return;
        }

        try {
          user = await TwitchStatusCommand.getUserInfo(
            access_token,
            twitchClientID,
            `${DBInfo.name}`
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(':x: Twitch Announcer has stopped!\n' + e);
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
          message.say(':x: Twitch Announcer has stopped!\n' + e);
          return;
        }
        if (streamInfo.data[0]) {
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
            gameInfo = await TwitchStatusCommand.getGames(
              access_token,
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
            clearInterval(Ticker);
            message.say(':x: Twitch Announcer has stopped!\n' + e);
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
          if (DBInfo.botSay.toLowerCase() != 'none') {
            await announcedChannel.message.say(DBInfo.botSay),
              await announcedChannel.send(onlineEmbed);
            var embedID = announcedChannel.lastMessage.id;
          } else {
            await announcedChannel.send(onlineEmbed);
            var embedID = announcedChannel.lastMessage.id;
          }
          currentMsgStatus = 'sent';
        }

        //Offline Trigger
        if (currentMsgStatus == 'offline') {
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
          await announcedChannel
            .fetchMessages({
              around: embedID,
              limit: 1
            })
            .then(msg => {
              const fetchedMsg = msg.first();
              fetchedMsg.edit(offlineEmbed);
            });
        }
      }, DBInfo.timer * 60000);
    }
  }
};
