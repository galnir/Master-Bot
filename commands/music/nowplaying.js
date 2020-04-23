const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Display the current playing song'
    });
  }

  run(message) {
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say('There is no song playing right now!');
    }
    const video = message.guild.musicData.nowPlaying;
    const videoEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setColor('#e9f931')
      .addField('Now Playing:', video.title);
    message.channel.send(videoEmbed);
    return;
  }
};
