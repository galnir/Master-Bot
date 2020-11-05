const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class DeletePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-playlist',
      group: 'music',
      memberName: 'delete-playlist',
      guildOnly: true,
      description: 'Delete a playlist from your saved playlists',
      args: [
        {
          key: 'playlistName',
          prompt: 'Which playlist would you like to delete?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if user has playlists or user is in the db
    const savedPlaylists = db.get(message.member.id).savedPlaylists;
    if (!savedPlaylists || savedPlaylists.length == 0) {
      message.reply('You have zero saved playlists!');
      return;
    }

    const savedPlaylistsClone = db.get(message.member.id).savedPlaylists;

    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      savedPlaylistsClone.splice(location, 1);
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(`I removed **${playlistName}** from your saved playlists!`);
    } else {
      message.reply(`You have no playlist named ${playlistName}`);
    }
  }
};
