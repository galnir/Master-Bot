const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

module.exports = class DisplayPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'display-playlist',
      group: 'music',
      aliases: ['my-playlist', 'show-playlist', 'songs-in'],
      memberName: 'display-playlist',
      guildOnly: true,
      description: 'Display a saved playlist',
      args: [
        {
          key: 'playlistName',
          prompt: 'What is the name of the playlist you would like to display?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
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
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        message.reply(`**${playlistName}** is empty!`);
        return;
      }
      const savedSongsEmbed = new Pagination.FieldsEmbed()
        .setArray(urlsArrayClone)
        .setAuthorizedUsers([message.member.id])
        .setChannel(message.channel)
        .setElementsPerPage(8)
        .formatField('# - Title', function(e) {
          return `**${urlsArrayClone.indexOf(e) + 1}**: [${e.title}](${e.url})`;
        });
      savedSongsEmbed.embed.setColor('#ff7373').setTitle('Saved Songs');
      savedSongsEmbed.build();
    } else {
      message.reply(`You have no playlist named ${playlistName}`);
    }
  }
};
