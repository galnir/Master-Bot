const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-playlist',
      group: 'music',
      memberName: 'create-playlist',
      guildOnly: true,
      description: 'Create a playlist',
      args: [
        {
          key: 'playlistName',
          prompt: 'What is the name of the playlist you would like to create?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if the user exists in the db
    if (!db.get(message.member.id)) {
      db.set(message.member.id, {
        savedPlaylists: [{ name: playlistName, urls: [] }]
      });
      message.reply(`Created a new playlist named **${playlistName}**`);
      return;
    }
    // make sure the playlist name isn't a duplicate
    var savedPlaylistsClone = db.get(message.member.id).savedPlaylists;
    if (
      savedPlaylistsClone.filter(function searchForDuplicate(playlist) {
        return playlist.name == playlistName;
      }).length > 0
    ) {
      message.reply(
        `There is already a playlist named **${playlistName}** in your saved playlists!`
      );
      return;
    }
    // create and save the playlist in the db
    savedPlaylistsClone.push({ name: playlistName, urls: [] });
    db.set(`${message.member.id}.savedPlaylists`, savedPlaylistsClone);
    message.reply(`Created a new playlist named **${playlistName}**`);
  }
};
