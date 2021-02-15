const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
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
    try {
      await message.delete();
    } catch {
      return;
    }

    const userFiltered = userQuery.toLowerCase();
    const userRes = await fetch(
      `https://splits.io/api/v4/runners?search=${userFiltered}`
    ).then(userRes => userRes.json());

    if (userRes.runners.length == 0) {
      message.reply(':x: The Runner ' + userQuery + ' was  not found.');
      return;
    }

    if (userRes.status == 404) {
      message.reply(':x: The Runner ' + userQuery + ' was  not found.');
      return;
    }

    const pbsRes = await fetch(
      `https://splits.io/api/v4/runners/${userRes.runners[0].name}/pbs`
    ).then(pbsRes => pbsRes.json());

    if (pbsRes.length == 0) {
      message.reply(
        ':x: The Runner ' +
          userRes.runners[0].name +
          `s hasn't submitted any speedruns to Splits.io\n
        Please try again later.`
      );
      return;
    }
    if (pbsRes.status == 404) {
      message.reply(':x: The User ' + userQuery + 's stats were not found.');
      return;
    }

    if (!userRes.runners.length == 0) {
      const pbArray = pbsRes.pbs;
      const pbEmbedArray = [];

      for (let i = 1; i <= pbsRes.pbs.length; ++i) {
        pbEmbedArray.push(
          new MessageEmbed()
            .setTitle(`Entry #` + i + ' of ' + pbsRes.pbs.length)
            .setURL('https://splits.io/' + pbArray[i - 1].id)
            .setAuthor(
              userRes.runners[0].name + '`s Speedrun Stats ',
              userRes.runners[0].avatar
            )
            .setThumbnail(pbArray[i - 1].game.cover_url)
            .addField('Game', pbArray[i - 1].game.name, true)

            .addField(`Category`, pbArray[i - 1].category.name, true)
            .addField(
              'Number of Segments',
              pbArray[i - 1].segments.length,
              true
            )
            .addField(
              'Finish Time',

              MySplitsIOCommand.convertTime(
                pbArray[i - 1].realtime_duration_ms
              ),
              true
            )
            .addField(
              'Sum Of Best',

              MySplitsIOCommand.convertTime(
                pbArray[i - 1].realtime_sum_of_best_ms
              ),
              true
            )
            .addField('Attempts', pbArray[i - 1].attempts, true)
            .addField('Timer Used', pbArray[i - 1].program)
            .setFooter(
              'Powered by Splits.io! Run was submited',
              'https://splits.io//assets/favicon/favicon-32x32-84a395f64a39ce95d7c51fecffdaa578e2277e340d47a50fdac7feb00bf3fd68.png'
            )
            .setTimestamp(pbArray[i - 1].parsed_at)
        );
      }

      const pbEmbed = new Pagination.Embeds()
        .setArray(pbEmbedArray)
        .setAuthorizedUsers([message.author.id])
        .setChannel(message.channel)
        .setColor('#3E8657')
        .setTimeout(60000)
        .setDeleteOnTimeout(true);
      return pbEmbed.build();
    }
  }
  // prettier-ignore
  // Differant than Src Command time convertion includes ms
  static convertTime(time) {
    let str, hr, min, sec, ms;
    let parts = time.toString().split('.');
    ms = parseInt(parts[0].substr(parts[0].length - 3));
    sec = parseInt(parts[0] / 1000);
    if (sec >= 60) {
      min = Math.floor(sec / 60);
      sec = sec % 60;
      sec = (sec < 10) ? ('0' + sec) : sec;
    }
    if (min >= 60) {
      hr = Math.floor(min / 60);
      min = min % 60;
      min = (min < 10) ? ('0' + min) : min;
    }
    if (ms < 10) ms = '00' + ms;
    else if (ms < 100) ms = '0' + ms;
    if (min === undefined) {
      str =
        (ms === undefined)
          ? (sec.toString() + 's')
          : (sec.toString() + 's ' + ms.toString() + 'ms');
    } else if (hr === undefined) {
      str =
        (ms === undefined)
          ? (min.toString() + 'm ' + sec.toString() + 's')
          : (min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms');
    } else {
      str =
        (ms === undefined)
          ? (hr.toString() + 'h ' + min.toString() + 'm ' + sec.toString() + 's')
          : (hr.toString() +
            'h ' +
            min.toString() +
            'm ' +
            sec.toString() +
            's ' +
            ms.toString() +
            'ms');
    }
    return str;
  }
};
