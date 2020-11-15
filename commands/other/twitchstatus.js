const { Command } = require('discord.js-commando');
const { twitchClientID, twitchToken } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const Twitch = require('simple-twitch-api');

module.exports = class TwitchStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitchstatus',
      memberName: 'twitchstatus',
      group: 'other',
      description: 'A quick check to see if a streamer is currently.',
      throttling: {
        usages: 45, // 45 queries
        duration: 60 // every 60 seconds
      },
      args: [
        {
          key: 'text',
          prompt: 'Who do you want to see is streaming?.',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { text }) {
    const SCOPE = 'user:read:broadcast';

    Twitch.getToken(twitchClientID, twitchToken, SCOPE).then(async result => {
      const access_token = result.access_token;

      const user = await Twitch.getUserInfo(access_token, twitchClientID, text);
      if (user.data[0] == null)
      return message.reply(`:x: No streamer found called ${text}`);
        let user_id = user.data[0].id;
      const streamInfo = await Twitch.getStream(
        access_token,
        twitchClientID,
        user_id
      );
        //console.log(streamInfo.data[0])
      if (streamInfo.data[0] == undefined)
        return message.reply(text + ' is not currently streaming');

        const gameInfo = await Twitch.getGames(
        access_token,
        twitchClientID,
        streamInfo.data[0].game_id
      );

      const onlineEmbed = new MessageEmbed()
        .setAuthor(
          text + ' is online!',
          user.data[0].profile_image_url,
          `https://twitch.tv/${streamInfo.data[0].user_name}`
        )
        .setThumbnail(
          gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
        )
        .addField('Stream Title:', streamInfo.data[0].title)
        .addField('Currently Playing:', streamInfo.data[0].game_name, true)
        .addField('Viewers:', streamInfo.data[0].viewer_count, true)
        .setColor('#6441A4')
        .setFooter('Stream Started:')
        .setImage(
          streamInfo.data[0].thumbnail_url.replace(/-{width}x{height}/g, '')
        )
        .setTimestamp(streamInfo.data[0].started_at);
      message.say(onlineEmbed);
    });
  }
};
