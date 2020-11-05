const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Youtube = require('simple-youtube-api');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'save-to-playlist',
      aliases: ['stp', 'save-song', 'add-to-playlist', 'add-song'],
      group: 'music',
      memberName: 'save-to-playlist',
      guildOnly: true,
      description: 'Save a song to a playlist',
      args: [
        {
          key: 'playlist',
          prompt: 'What is the playlist you would like to save to?',
          type: 'string'
        },
        {
          key: 'url',
          prompt:
            'What url would you like to save to playlist? It can also be a playlist url',
          type: 'string'
          // default: '' // after supporting adding currently playing song
        }
      ]
    });
  }

  async run(message, { url, playlist }) {
    // check if user has playlists or user is in the db
    const savedPlaylistsClone = db.get(message.member.id).savedPlaylists;
    if (!savedPlaylistsClone || savedPlaylistsClone.length == 0) {
      message.reply('You have zero saved playlists!');
      return;
    }

    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlist) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      urlsArrayClone.push(await SaveToPlaylistCommand.processURL(url, message));
      savedPlaylistsClone.urls = urlsArrayClone;
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      console.log(db.get(message.member.id).savedPlaylists[location].urls);
    } else {
      message.reply(`You have no playlist named ${playlist}`);
      return;
    }
  }

  static async processURL(url, message) {
    url = url
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const id = url[2].split(/[^0-9a-z_\-]/i)[0];
    const video = await youtube.getVideoByID(id).catch(function() {
      message.say(':x: There was a problem getting the video you provided!');
      return;
    });
    if (video.raw.snippet.liveBroadcastContent === 'live') {
      message.reply("I don't support live streams!");
      return false;
    }
    return SaveToPlaylistCommand.constructSongObj(video);
  }
  static constructSongObj(video) {
    let duration = this.formatDuration(video.duration);
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url
    };
  }
  // prettier-ignore
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
};
