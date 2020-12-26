/* eslint-disable @getify/proper-ternary/parens */

const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SpeedrunBasicCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'speedrun',
      group: 'speedrun',
      aliases: ['sr', 'wr', 'src'],
      memberName: 'speedrun',
      description: 'Replies with speedrun info of the main category.',
      throttling: {
        usages: 1,
        duration: 6
      },
      args: [
        {
          key: 'query',
          prompt: 'What game what would you like to find?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { query }) {
    const respInitial = await fetch(
      `https://www.speedrun.com/api/v1/games?name=${query}`
    );

    const initial = await respInitial.json();
    if (initial.data.length === 0) {
      message.say(':x: No game was found.');
    } else {
      let gameID = initial.data[0].id;

      const response = await fetch(
        `https://www.speedrun.com/api/v1/games/${gameID}/records?miscellaneous=no&scope=full-game&top=1&embed=game,category,players,platforms,regions`
      );
      const body = await response.json();

      if (body.data.length === 0) {
        const gameNameArr = [];
        initial.data.slice(0, 6).forEach(id => {
          gameNameArr.push(id.names.international);
        });
        var gameName = new MessageEmbed()
          .setColor('#3E8657')
          .setTitle(':mag: Search Results')
          .setThumbnail(initial.data[0].assets['cover-medium'].uri)
          .addField(':x: Try searching again with the following suggestions.', initial.data[0].names.international + ` doesn't have any runs.`)
          .setTimestamp()
          .setFooter('Powered by www.speedrun.com', '');
        for (let i = 1; i < gameNameArr.length; i++) {
          gameName.addField(`:video_game: Result ${i}`,gameNameArr[i],)
        }
        message.say(gameName)
      
      } else {
        let platform =
          body.data[0].platforms.data.length > 0
            ? body.data[0].platforms.data[0].name
            : '';
        let region =
          body.data[0].regions.data.length > 0
            ? ' - ' + body.data[0].regions.data[0].name
            : '';
        let emu = body.data[0].runs[0].run.system.emulated ? ' [EMU]' : '';
        let runnerName =
          body.data[0].players.data[0].rel === 'user'
            ? body.data[0].players.data[0].names.international
            : body.data[0].players.data[0].name;

        const embed = new MessageEmbed()
          .setColor('#3E8657')
          .setTitle(
            SpeedrunBasicCommand.convertTime(
              body.data[0].runs[0].run.times.primary_t
            ) +
              ' by ' +
              runnerName
          )
          .setThumbnail(body.data[0].game.data.assets['cover-medium'].uri)
          .setURL(body.data[0].runs[0].run.weblink)
          .setAuthor(
            body.data[0].game.data.names.international +
              ' - ' +
              body.data[0].category.data.name, 'https://i.imgur.com/PpxR9E1.png', 'http://speedrun.com/'
          )
          .addField(':calendar_spiral: Date Played:', body.data[0].runs[0].run.date)
          .addField(':video_game: Played On:', platform + region + emu)
          .setTimestamp()
          .setFooter('Powered by www.speedrun.com', '');

        message.channel.send(embed);
      }
    }
  }
  static convertTime(time) {
    let str, hr, min, sec, ms;
    let parts = time.toString().split('.');
    ms =
      parts.length > 1 ? parseInt((parts[1] + '00').substr(0, 3)) : undefined;
    sec = parseInt(parts[0]);
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
