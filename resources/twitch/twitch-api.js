const fetch = require('node-fetch');
const { twitchClientID, twitchClientSecret } = require('../../config.json');

if (twitchClientID == null || twitchClientSecret == null)
  return console.log(
    'INFO: Twitch Features were removed from the list. \nMake sure you have "twitchClientID" and "twitchClientSecret" in your config.json to use Twitch Features '
  );

module.exports = class TwitchAPI {
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
