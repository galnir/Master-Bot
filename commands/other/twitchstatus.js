const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { twitchClientID, twitchClientSecret } = require('../../config.json');
const { MessageEmbed } = require('discord.js');

if (twitchClientID == null || twitchClientSecret == null)
  return console.log(
    'INFO: TwitchStatus command removed from the list. \nMake sure you have twitchClientID and twitchToken in your config.json to use TwitchStatus command!'
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

  async run(message, { textRaw }) {
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
      message.say(e);
      return;
    }

    try {
      var user = await TwitchStatusCommand.getUserInfo(
        access_token,
        twitchClientID,
        textFiltered
      );
    } catch (e) {
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
      message.say(e);
      return;
    }

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
      message.say(offlineEmbed);
      return;
    }
    try {
      var gameInfo = await TwitchStatusCommand.getGames(
        access_token,
        twitchClientID,
        streamInfo.data[0].game_id
      );
    } catch (e) {
      message.say(e);
      return;
    }

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
      onlineEmbed.setThumbnail(
        gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
      );
    if (user.data[0].broadcaster_type == '')
      onlineEmbed.addField('Rank:', 'BASE!', true);
    else {
      onlineEmbed.addField(
        'Rank:',
        user.data[0].broadcaster_type.toUpperCase() + '!',
        true
      );
    }
    message.say(onlineEmbed);
    return;
  }
  static getToken(twitchClientID, twitchClientSecret, scope) {
    return new Promise(async function fetchToken(resolve, reject) {
      try {
        const response = await fetch(
          `https://id.twitch.tv/oauth2/token?client_id=${twitchClientID}&client_secret=${twitchClientSecret}&grant_type=client_credentials&scope=${scope}`,
          {
            method: 'POST'
          }
        );
        const json = await response.json();
        if (json.status == 400) {
          reject(
            'Something went wrong when trying to fetch a twitch access token'
          );
        } else {
          resolve(json.access_token);
        }
      } catch (e) {
        console.error(e);
        reject('There was a problem fetching a token from the Twitch API');
      }
    });
  }
  static getUserInfo(token, client_id, username) {
    return new Promise(async function fetchUserInfo(resolve, reject) {
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/users?login=${username}`,
          {
            method: 'GET',
            headers: {
              'client-id': `${client_id}`,
              Authorization: `Bearer ${token}`
            }
          }
        );
        const json = await response.json();
        if (json.status == `400`) {
          reject(`:x: ${username} was Invaild, Please try again.`);
          return;
        }

        if (json.status == `429`) {
          reject(`:x: Rate Limit exceeded. Please try again in a few minutes.`);
          return;
        }

        if (json.status == `503`) {
          reject(
            `:x: Twitch service's are currently unavailable. Please try again later.`
          );
          return;
        }

        if (json.data[0] == null) {
          reject(`:x: Streamer ${username} was not found, Please try again.`);
          return;
        }
        resolve(json);
      } catch (e) {
        console.error(e);
        reject('There was a problem fetching user info from the Twitch API');
      }
    });
  }
  static getStream(token, client_id, userID) {
    return new Promise(async function fetchStream(resolve, reject) {
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/streams?user_id=${userID}`,
          {
            method: 'GET',
            headers: {
              'client-id': `${client_id}`,
              Authorization: `Bearer ${token}`
            }
          }
        );
        const json = await response.json();
        resolve(json);
      } catch (e) {
        console.error(e);
        reject('There was a problem fetching stream info from the Twitch API');
      }
    });
  }
  static getGames(token, client_id, game_id) {
    return new Promise(async function fetchGames(resolve, reject) {
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/games?id=${game_id}`,
          {
            method: 'GET',
            headers: {
              'client-id': `${client_id}`,
              Authorization: `Bearer ${token}`
            }
          }
        );
        const json = await response.json();
        resolve(json);
      } catch (e) {
        console.error(e);
        reject('There was a problem fetching stream info from the Twitch API');
      }
    });
  }
};
