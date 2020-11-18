const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['song-list', 'next-songs', 'q'],
      group: 'music',
      memberName: 'queue',
      guildOnly: true,
      description: 'Display the song queue!'
    });
  }

  run(message) {
    if (message.guild.triviaData.isTriviaRunning)
      return message.say(':x: Try again after the trivia has ended!');
    if (message.guild.musicData.queue.length == 0)
      return message.say(':x: There are no songs in queue!');
    const queueClone = message.guild.musicData.queue;
    const queueEmbed = new Pagination.FieldsEmbed()
      .setArray(queueClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - Song', function(e) {
        return `**${queueClone.indexOf(e) + 1}**: ${e.title}`;
      });

    queueEmbed.embed.setColor('#ff7373').setTitle('Music Queue');
    queueEmbed.build();
  }
};
