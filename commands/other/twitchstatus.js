const { Command } = require('discord.js-commando');
const { twitchClientID, twitchToken } = require('../../config.json');
const { MessageEmbed } = require('discord.js');
const Twitch = require('simple-twitch-api');

if ((twitchClientID == null, twitchToken == null))
  return console.log(
    'WARNING: TwitchStatus command removed from the list. \nMake sure you have twitchCLIENTID and twitchToken in your config.json to use TwitchStatus command'
  );
module.exports = class TwitchStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitchstatus',
      memberName: 'twitchstatus',
      aliases: ['twitch-shout-out', 'twitchshoutout', 'tso'],
      group: 'other',
      description:
        'A quick check to see if a streamer is currently. or to give a shout-out a fellow streamer',
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

  run(message, { text }) {
    const SCOPE = 'user:read:email';
    Twitch.getToken(twitchClientID, twitchToken, SCOPE).then(async result => {
      const access_token = result.access_token;
      if (access_token == null)
        return (
          console.log(
            'Error: Double check the values of twitchCLIENTID and twitchToken in your config.json'
          ) + message.say(':x: Something went wrong!')
        );

      const user = await Twitch.getUserInfo(access_token, twitchClientID, text);

      if (user.status == `400`)
        return message.delete() + message.reply(`:x: ${text} was Invaild, Please try again.`);

      if (user.data[0] == null)
        return message.delete() + message.reply(
          `:x: Streamer ${text} was not found, Please try again.`
        );

      const user_id = user.data[0].id;

      const streamInfo = await Twitch.getStream(
        access_token,
        twitchClientID,
        user_id
      );

      if (streamInfo.data[0] == null)
        return (
          message.delete() + message.say(text + ' is not currently streaming')
        );

      const gameInfo = await Twitch.getGames(
        access_token,
        twitchClientID,
        streamInfo.data[0].game_id
      );

      const onlineEmbed = new MessageEmbed()
        .setAuthor(
          'Streamer Status Check',
          user.data[0].profile_image_url,
          'https://twitch.tv/' + streamInfo.data[0].user_name
        )
        .setURL('https://twitch.tv/' + streamInfo.data[0].user_name)
        .setTitle('Looks like ' + streamInfo.data[0].user_name + ' is online!')
        .setThumbnail(
          gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
        )
        .addField('Stream Title:', streamInfo.data[0].title)
        .addField('Currently Playing:', streamInfo.data[0].game_name, true)
        .addField('Viewers:', streamInfo.data[0].viewer_count, true)
        .setColor('#6441A4')
        .setFooter('Stream Started')
        .setImage(
          streamInfo.data[0].thumbnail_url.replace(
            /-{width}x{height}/g,
            '-1280x720'
          )
        )
        .setTimestamp(streamInfo.data[0].started_at);
      if (
        (user.data[0].broadcaster_type === 'partner',
        user.data[0].broadcaster_type === 'affiliate')
      )
        onlineEmbed.addField(
          'Rank:',
          user.data[0].broadcaster_type.toUpperCase() + '!',
          true
        );
      message.delete();
      message.say(onlineEmbed);
    });
  }
};
