const { Command } = require('discord.js-commando');
const { twitchClientID, twitchToken } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const Twitch = require('simple-twitch-api');

if (twitchClientID == null || twitchToken == null)
  return console.log(
    'INFO: TwitchStatus command removed from the list. \nMake sure you have twitchCLIENTID and twitchToken in your config.json to use TwitchStatus command'
  );
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

  run(message, { textRaw }) {
    const SCOPE = 'user:read:email';
    Twitch.getToken(twitchClientID, twitchToken, SCOPE).then(async result => {
      const access_token = result.access_token;

      if (access_token == null)
        return (
          console.log(
            'ERROR: Double check the values of twitchCLIENTID and twitchToken in your config.json'
          ) + message.say(':x: Something went wrong!')
        );

      const textFiltered = textRaw.replace(/https\:\/\/twitch.tv\//g, '');

      const user = await Twitch.getUserInfo(
        access_token,
        twitchClientID,
        textFiltered
      );

      if (user.status == `400`)
        return message.reply(
          `:x: ${textFiltered} was Invaild, Please try again.`
        );

      if (user.status == `429`)
        return message.reply(
          `:x: Rate Limit exceeded. Please try again in a few minutes.`
        );

      if (user.status == `503`)
        return message.reply(
          `:x: Twitch service's are currently unavailable. Please try again later.`
        );

      if (user.data[0] == null)
        return message.reply(
          `:x: Streamer ${textFiltered} was not found, Please try again.`
        );

      const user_id = user.data[0].id;

      const streamInfo = await Twitch.getStream(
        access_token,
        twitchClientID,
        user_id
      );

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
        return message.say(offlineEmbed);
      }

      const gameInfo = await Twitch.getGames(
        access_token,
        twitchClientID,
        streamInfo.data[0].game_id
      );

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
          .setTimestamp(streamInfo.data[0].started_at);
          if (gameInfo.data[0].box_art_url.search(/.jpg/g))
          onlineEmbed.setThumbnail(user.data[0].profile_image_url);
        else
          onlineEmbed
            .setThumbnail(
              gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
            )
      if (user.data[0].broadcaster_type == '')
        onlineEmbed.addField('Rank:', 'BASE!', true);
      else {
        onlineEmbed.addField(
          'Rank:',
          user.data[0].broadcaster_type.toUpperCase() + '!',
          true
        );
      }
      return message.say(onlineEmbed);
    });
  }
};
