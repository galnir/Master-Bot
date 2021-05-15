const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const { prefix } = require('../../config.json');

module.exports = class QueueHistoryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'history',
      aliases: [
        'song-history',
        'queue-history',
        'history-queue',
        'play-history',
        'history-play'
      ],
      group: 'music',
      memberName: 'history',
      guildOnly: true,
      description: 'Display the queue history!',
      examples: [
        'For example, how play the 3rd song from the history queue',
        `${prefix}play 3`
      ]
    });
  }

  run(message) {
    if (message.guild.triviaData.isTriviaRunning) {
      message.reply(':x: Try again after the trivia has ended!');
      return;
    }
    if (message.guild.musicData.queueHistory.length === 0) {
      message.reply(':x: There are no songs in the queue history!');
      return;
    }

    const paginateArray = [];
    message.guild.musicData.queueHistory.forEach((element, index) => {
      paginateArray.push(
        `**${index + 1}**: [${element.title}](${element.url})`
      );
    });

    const queueEmbed = new Pagination.FieldsEmbed()
      .setArray(paginateArray)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(8)
      .formatField('# - Song', function(element) {
        return element;
      });

    queueEmbed.embed.setColor('#ff7373').setTitle('Music Queue History');
    queueEmbed.build();
  }
};
