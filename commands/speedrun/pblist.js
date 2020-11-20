const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');
const fetch = require('node-fetch');

module.exports = class MySplitsIOCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'speedrunner-stats',
      aliases: ['personal-bests', 'pbs'],
      group: 'speedrun',
      memberName: 'speedrunner-stats',
      description: 'Show off your splits from Splits.io',
      args: [
        {
          key: 'userQuery',
          prompt: 'Who do you want to look up',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userQuery }) {
    if (message.channel == true)
      message.delete();
    
    const userFiltered = userQuery.toLowerCase();

    const userRes = await fetch(
      `https://splits.io/api/v4/runners?search=${userFiltered}`
    ).then(userRes => userRes.json());
    if (userRes.runners.length == 0)
      return message.say(
        ':x: The User ' + userQuery + ' was not found. Please try again.'
      );

    const gameRes = await fetch(
      `https://splits.io/api/v4/runners/${userRes.runners[0].name}/pbs`
    ).then(gameRes => gameRes.json());

    if (!userRes.runners.length == 0 || !gameRes == null) {
      const pbArray = gameRes.pbs;
      const pbEmbed = new Pagination.FieldsEmbed()
        .setArray(pbArray)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setElementsPerPage(10)
        .formatField(
          'Game',
          function(e) {
            return `**${pbArray.indexOf(e) + 1}**: ${e.game.name}`;
          },
          true
        )
        .formatField(
          'Time',
          function(e) {
            return MySplitsIOCommand.convertTime(e.realtime_duration_ms);
          },
          true
        )
        .formatField(
          'Attempts',
          function(e) {
            return e.attempts;
          },
          true
        )
        .setDeleteOnTimeout(true);

      pbEmbed.embed
        .setColor('#ff7373')
        .setAuthor(
          userRes.runners[0].name + '`s Speedrun Stats ',
          userRes.runners[0].avatar
        )
        .setThumbnail(userRes.runners[0].avatar);
      console.log(pbArray);
      pbEmbed.build();
    }
    console.log(userRes, gameRes.pbs);
    console.log(
      userRes,
      gameRes.pbs.map(el => el.game)
    );
  }
// Differant than Src Command time convertion - includes ms
  static convertTime(time) {
    let str, hr, min, sec, ms;
    let parts = time.toString().split('.');
    ms = parseInt(parts[0].substr(parts[0].length - 3));
    sec = parseInt(parts[0] / 1000);
    if (sec >= 60) {
      min = Math.floor(sec / 60);
      sec = sec % 60;
      sec = sec < 10 ? '0' + sec : sec;
    }
    if (min >= 60) {
      hr = Math.floor(min / 60);
      min = min % 60;
      min = min < 10 ? '0' + min : min;
    }
    if (ms < 10) ms = '00' + ms;
    else if (ms < 100) ms = '0' + ms;
    if (min === undefined) {
      str =
        ms === undefined
          ? sec.toString() + 's'
          : sec.toString() + 's ' + ms.toString() + 'ms';
    } else if (hr === undefined) {
      str =
        ms === undefined
          ? min.toString() + 'm ' + sec.toString() + 's'
          : min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    } else {
      str =
        ms === undefined
          ? hr.toString() + 'h ' + min.toString() + 'm ' + sec.toString() + 's'
          : hr.toString() +
            'h ' +
            min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms';
    }
    return str;
  }
};
