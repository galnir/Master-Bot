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
          key: 'index',
          prompt:
            'What is the index of the video you would like to delete from your saved playlist?',
          type: 'string',
          validate: function validateIndex(index) {
            return index > 0;
          }
        }
      ]
    });
  }

  async run(message, { playlist, index }) {
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

      if (index > urlsArrayClone.length) {
        message.reply(
          `The index you provided is larger than the playlist's length`
        );
        return;
      }
      const title = urlsArrayClone[index - 1].title;
      urlsArrayClone.splice(index - 1, 1);
      savedPlaylistsClone[location].urls = urlsArrayClone;
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(
        `I removed **${title}** from **${savedPlaylistsClone[location].name}**`
      );
      return;
    } else {
      message.reply(`You have no playlist named **${playlist}**`);
      return;
    }
  }
};
