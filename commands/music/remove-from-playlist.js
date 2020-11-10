const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-from-playlist',
      aliases: ['delete-song', 'remove-song'],
      group: 'music',
      memberName: 'remove-from-playlist',
      guildOnly: true,
      description: 'Remove a song from a saved playlist',
      args: [
        {
          key: 'playlist',
          prompt: 'What is the playlist you would like to delete a video from?',
          type: 'string'
        },
        {
          // will be changed in later updates from url to location in playlist
          key: 'url',
          prompt:
            'What is the url of the video you would like to delete from your saved playlist?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { playlist, url }) {
    // check if user has playlists or user is in the db
    const dbUserFetch = db.get(message.member.id);
    if (!dbUserFetch) {
      message.reply('You have zero saved playlists!');
      return;
    }
    const savedPlaylistsClone = dbUserFetch.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
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
      if (urlsArrayClone.length == 0) {
        message.reply(`**${playlist}** is empty!`);
        return;
      }
      let foundURL = false;
      for (let i = 0; i < urlsArrayClone.length; i++) {
        if (urlsArrayClone[i].url == url) {
          foundURL = true;
          urlsArrayClone.splice(i, 1);
          savedPlaylistsClone[location].urls = urlsArrayClone;
          db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
          message.reply(`I removed the url you requested from **${playlist}**`);
          break;
        }
      }
      if (!foundURL) {
        message.reply(`The URL you provided does not exist in **${playlist}**`);
      }
      return;
    } else {
      message.reply(`You have no playlist named **${playlist}**`);
      return;
    }
  }
};
