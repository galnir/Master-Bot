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
      aliases: ['twitch-announcer', 'twitchannounce', 'ta'],
      group: 'guild',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['SEND_MESSAGES', 'MENTION_EVERYONE'],
      description: 'Allows you to start and stop the Twitch Announcer.',
      args: [
        {
          key: 'textRaw',
          prompt:
            'Would You like to ***Enable*** or ***Disable*** the Twitch Announcer?',
          type: 'string',
          oneOf: ['enable', 'disable']
        }
      ]
    });
  }

  async run(message, { textRaw }) {
    var Twitch_DB = new db.table('Twitch_DB');
    if (Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`) == undefined)
      return message.reply(
        `:no_entry: No Settings were found, Please run ${prefix}twitch-announcer-settings command first`
      );
    var textFiltered = textRaw.toLowerCase();
    if (textFiltered == 'disable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'disable');
      return message.say('Announcer has been Disabled.');
    }
    if (textFiltered == 'enable') {
      Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'enable');
      message.say(`:white_check_mark: Announcer has been Enabled!
      Streamer: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.name}***
      Channel: ***${Twitch_DB.get(message.guild.id).twitchAnnouncer.channel}***
      Timer: ***${
        Twitch_DB.get(message.guild.id).twitchAnnouncer.timer
      }*** minutes`);

      var Ticker = setInterval(async function() {
        let statusCheck = Twitch_DB.get(
          `${message.guild.id}.twitchAnnouncer.status`
        );

        if (statusCheck == 'disable') {
          clearInterval(Ticker);
        }

        let announcedChannel = message.guild.channels.cache.find(
          c => c.name == Twitch_DB.get(message.guild.id).twitchAnnouncer.channel
        );

        const scope = 'user:read:email';
        let access_token;
        try {
          access_token = await TwitchStatusCommand.getToken(
            twitchClientID,
            twitchClientSecret,
            scope
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(e);
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
          message.say(e);
          return;
        }

        const user_id = user.data[0].id;
        try {
          var streamInfo = await TwitchStatusCommand.getStream(
            access_token,
            twitchClientID,
            user_id
          );
        } catch (e) {
          clearInterval(Ticker);
          message.say(e);
          return;
        }

        if (!streamInfo.data[0])
          return Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.status`,
            'offline'
          );
        else {
          Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'online');
        }
        //Online Embed Post
        if (statusCheck == 'online' || statusCheck == 'enable') {
          Twitch_DB.set(`${message.guild.id}.twitchAnnouncer.status`, 'sent');
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.gameName`,
            streamInfo.data[0].game_name
          );
          try {
            var gameInfo = await TwitchStatusCommand.getGames(
              access_token,
              twitchClientID,
              streamInfo.data[0].game_id
            );
          } catch (e) {
            clearInterval(Ticker);
            message.say(e);
            return;
          }

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
          if (gameInfo.data[0].box_art_url.search(/.jpg/g))
            onlineEmbed.setThumbnail(user.data[0].profile_image_url);
          else
            onlineEmbed.setThumbnail(
              gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
            );

          announcedChannel.send(
            'Hey @everyone, ' + user.data[0].display_name + ' is Online!'
          ),
            announcedChannel.send(onlineEmbed);
        }
        //Game Change Embed Edit
        if (
          streamInfo.data[0].game_name !=
          Twitch_DB.get(`${message.guild.id}.twitchAnnouncer.gameName`)
        ) {
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.gameName`,
            streamInfo.data[0].game_name
          );
          try {
            var gameInfo = await TwitchStatusCommand.getGames(
              access_token,
              twitchClientID,
              streamInfo.data[0].game_id
            );
          } catch (e) {
            clearInterval(Ticker);
            message.say(e);
            return;
          }
          const changedEmbed = new MessageEmbed()
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
            .setTimestamp(streamInfo.data[0].started_at);
          if (user.data[0].broadcaster_type == '')
            changedEmbed.addField('Rank:', 'BASE!', true);
          else {
            changedEmbed.addField(
              'Rank:',
              user.data[0].broadcaster_type.toUpperCase() + '!',
              true
            );
          }
          if (gameInfo.data[0].box_art_url.search(/.jpg/g))
            changedEmbed.setThumbnail(user.data[0].profile_image_url);
          else
            changedEmbed.setThumbnail(
              gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
            );
          try {
            changedEmbed.edit(changedEmbed);
          } catch {
            return;
          }
        }
        //Offline Embed Edit
        if (statusCheck == 'offline') {
          Twitch_DB.set(
            `${message.guild.id}.twitchAnnouncer.status`,
            'offline'
          );
          const offlineEmbed = new MessageEmbed()
            .setAuthor(
              'Streamer Status Check',
              user.data[0].profile_image_url,
              'https://twitch.tv/' + user.data[0].display_name
            )
            .setURL('https://twitch.tv/' + user.data[0].display_name)
            .setTitle(
              'Looks like ' + user.data[0].display_name + ' is: Offline.'
            )
            .setColor('#6441A4')
            .setTimestamp(user.data[0].created_at)
            .setFooter(
              'Joined Twitch',
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
          try {
            announcedChannel.edit(offlineEmbed);
          } catch {
            return;
          }
        }
      }, Twitch_DB.get(message.guild.id).twitchAnnouncer.timer * 60 * 1000);
    }
  }
};
