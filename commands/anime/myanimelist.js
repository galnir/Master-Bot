const fetch = require('node-fetch');
const { clientidMAL } = require('aws-sdk');
const { Command } = require('discord.js-commando');
const crypto = require('crypto');
var axios = require('axios').default;
var http = require('http');

module.exports = class Myanimelist extends Command {
  constructor(client) {
    super(client, {
      name: 'myanimelist',
      group: 'anime',
      aliases: ['mal'],
      memberName: 'myanimelist',
      description:
        'Komendy myanimelist',
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  run(message) {
    function base64URLEncode(str) {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    function sha256(buffer) {
        return crypto.createHash('sha256').update(buffer).digest();
    }   

    var verifier = base64URLEncode(crypto.randomBytes(32));
    console.log(verifier)
    var challenge = base64URLEncode(sha256(verifier));
    console.log(challenge)
    var options = {
        method: 'POST',
        url: 'https://YOUR_DOMAIN/oauth/token',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: {
          grant_type: 'authorization_code',
          client_id: clientidMAL,
          code_verifier: verifier,
          code: challenge
        }
      };
    var options2 = {
        method: 'GET',
        url: 'https://myanimelist.net/v1/oauth2/authorize?',
        headers: {'content-type': 'text/html'},
        data: {
          response_type: 'code',
        //  grant_type: 'authorization_code',
          client_id: clientidMAL,
          code_challenge: challenge,
          state: 'RequestID42'
        }
    };
    const url = `https://myanimelist.net/v1/oauth2/authorize?` +
                `response_type=code&` +
                `cliend_id=${clientidMAL}&` +
                `code_challange=${challenge}&` +
                `state=RequestID42`;
    console.log(url)
    
    console.log(axios.get(url));
    /*axios.request(options2).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });
    fetch(options2)
      .then(result => console.log(result))
    fetch(`https://api.myanimelist.net/v2/users/{user_name}/animelist`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(e => {
        message.say('Nie znaleziono gifa.');
        // console.error(e);
        return;
      });*/
  }
};