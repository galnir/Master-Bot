const fetch = require('node-fetch');
const { twitchClientID, twitchClientSecret } = require('../../config.json');

// Skips loading if not found in config.json
if (!twitchClientID || !twitchClientSecret) return;

module.exports = class TwitchAPI {
  //Access Token is valid for 24 Hours
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

  //userInfo.data[0]
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
          reject(`:x: ${username} was Invalid, Please try again.`);
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

  // streamInfo.data[0]
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

  // gameInfo.data[0]
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

// get first access_token
const TwitchAPI = require('./twitch-api.js'); // having this at the Top gives a Circular Error Message
const scope = 'user:read:email';
(async function() {
  await TwitchAPI.getToken(twitchClientID, twitchClientSecret, scope)
    .then(result => {
      module.exports.access_token = result;
      return;
    })
    .catch(e => {
      console.log(e);
      return;
    });
})();
// 24 Hour access_token refresh
setInterval(async function() {
  await TwitchAPI.getToken(twitchClientID, twitchClientSecret, scope)
    .then(result => {
      module.exports.access_token = result;
    })
    .catch(e => {
      console.log(e);
      return;
    });
}, 86400000);
