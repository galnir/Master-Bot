const { Command } = require('discord.js-commando');
const TwitchAPI = require('../../resources/twitch/twitch-api.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { twitchClientID, twitchClientSecret } = require('../../config.json');
const Canvas = require('canvas');
const probe = require('probe-image-size');

// Skips loading if not found in config.json
if (!twitchClientID || !twitchClientSecret) return;

module.exports = class TwitchStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitchstatus',
      memberName: 'twitchstatus',
      aliases: ['twitch-shout-out', 'twitchshoutout', 'tso'],
      group: 'other',
      description:
        'A quick check to see if a streamer is currently online. or to give a shout-out a fellow streamer',
      throttling: {
        usages: 45, // 45 queries
        duration: 60 // every 60 seconds
      },
      args: [
        {
          key: 'textRaw',
          prompt: 'Who do you want to see is streaming?.',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { textRaw }) {
    // Twitch Section
    const scope = 'user:read:email';
    const textFiltered = textRaw.replace(/https\:\/\/twitch.tv\//g, '');
    let access_token;

    try {
      access_token = await TwitchAPI.getToken(
        twitchClientID,
        twitchClientSecret,
        scope
      );
    } catch (e) {
      message.reply(e);
      return;
    }

    try {
      var user = await TwitchAPI.getUserInfo(
        access_token,
        twitchClientID,
        textFiltered
      );
    } catch (e) {
      message.reply(e);
      return;
    }

    const user_id = user.data[0].id;

    try {
      var streamInfo = await TwitchAPI.getStream(
        access_token,
        twitchClientID,
        user_id
      );
    } catch (e) {
      message.reply(e);
      return;
    }

    //Offline Trigger
    if (streamInfo.data[0] == null) {
      const offlineEmbed = new MessageEmbed()
        .setAuthor(
          'Streamer Status Check',
          user.data[0].profile_image_url,
          'https://twitch.tv/' + user.data[0].display_name
        )
        .setURL('https://twitch.tv/' + user.data[0].display_name)
        .setTitle('Looks like ' + user.data[0].display_name + ' is: Offline.')
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
      message.channel.send(offlineEmbed);
      return;
    }

    // Box Art Recreation
    try {
      var gameInfo = await TwitchAPI.getGames(
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
      var attachment = new MessageAttachment(canvas.toBuffer(), 'box_art.png');
    } catch (e) {
      message.reply(e);
      return;
    }

    // Online Embed
    const onlineEmbed = new MessageEmbed()
      .setAuthor(
        'Streamer Status Check',
        user.data[0].profile_image_url,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setURL('https://twitch.tv/' + user.data[0].display_name)
      .setTitle('Looks like ' + user.data[0].display_name + ' is: Online!')
      .addField('Stream Title:', streamInfo.data[0].title)
      .addField('Currently Playing:', streamInfo.data[0].game_name, true)
      .addField('Viewers:', streamInfo.data[0].viewer_count, true)
      .setColor('#6441A4')
      .setFooter(
        'Stream Started',
        'https://static.twitchcdn.net/assets/favicon-32-d6025c14e900565d6177.png'
      )
      .setImage(
        streamInfo.data[0].thumbnail_url
          .replace(/{width}x{height}/g, '1280x720')
          .concat('?r=' + Math.floor(Math.random() * 10000 + 1))
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
    message.channel.send(onlineEmbed);
    return;
  }
};
