const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class MyPlaylistsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'my-playlists',
      aliases: ['mps', 'my-queues', 'my-saved-queues'],
      group: 'music',
      memberName: 'my-playlists',
      guildOnly: true,
      description: 'List your saved playlists'
    });
  }

  run(message) {
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

    // basic implementation
    let playlistNames = '';
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      playlistNames = `${playlistNames} ${savedPlaylistsClone[i].name} ${
        i == savedPlaylists.length ? '' : ',' // eslint-disable-line
      }`;
    }
    message.reply(`Your playlists are: ${playlistNames}`);
  }
};
