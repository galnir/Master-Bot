/* eslint-disable @getify/proper-ternary/parens */

const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Pagination = require('discord-paginationembed');

module.exports = class SpeedrunBasicCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'speedrun',
      group: 'speedrun',
      aliases: ['sr', 'wr', 'src'],
      memberName: 'speedrun',
      description:
        'Replies with the Top 10 speedrun results in every category.',
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
        `https://www.speedrun.com/api/v1/games/${gameID}/records?miscellaneous=no&scope=full-game&top=10&embed=game,category,players,platforms,regions`
      );
      const body = await response.json();

      if (body.data.length === 0) {
        const gameNameArr = [];
        initial.data.slice(0, 6).forEach(id => {
          gameNameArr.push(id.names.international);
        });
        let gameName = new MessageEmbed()
          .setColor('#3E8657')
          .setTitle(':mag: Search Results')
          .setThumbnail(initial.data[0].assets['cover-medium'].uri)
          .addField(
            ':x: Try searching again with the following suggestions.',
            initial.data[0].names.international + ` doesn't have any runs.`
          )
          .setTimestamp()
          .setFooter('Powered by www.speedrun.com', '');
        for (let i = 1; i < gameNameArr.length; i++) {
          gameName.addField(`:video_game: Result ${i}`, gameNameArr[i]);
        }
        message.say(gameName);
      } else {
        const embedArray = [];

        let number = 0;

        let category = body.data;

        for (let i = 1; i <= category[0].players.data.length; ++i) {
          let platform =
            category[0].platforms.data.length > 0
              ? category[0].platforms.data[0].name
              : '';
          let region =
            category[0].regions.data.length > 0
              ? ' - ' + category[0].regions.data[0].name
              : '';
          let emu = category[0].runs[i - 1].run.system.emulated ? ' [EMU]' : '';
          let runnerName =
            category[0].players.data[i - 1].rel === 'user'
              ? category[0].players.data[i - 1].names.international
              : category[0].players.data[i - 1].name;

          let trophyIcon;
          if (i == 1) trophyIcon = '🏆 WR: ';
          if (i == 2) trophyIcon = '🥈 2nd: ';
          if (i == 3) trophyIcon = '🥉 3rd: ';
          if (i >= 4) trophyIcon = `${i}th: `;

          embedArray.push(
            new MessageEmbed()
              .setColor('#3E8657')
              .setTitle(
                trophyIcon +
                  SpeedrunBasicCommand.convertTime(
                    category[0].runs[i - 1].run.times.primary_t
                  ) +
                  ' by ' +
                  runnerName
              )
              .setThumbnail(category[0].game.data.assets['cover-medium'].uri)
              .setURL(category[0].runs[i - 1].run.weblink)
              .setAuthor(
                category[0].game.data.names.international +
                  ' - ' +
                  category[0].category.data.name,
                '',
                'http://speedrun.com/'
              )
              .addField(
                ':calendar_spiral: Date Played:',
                category[0].runs[i - 1].run.date
              )
              .addField(':video_game: Played On:', platform + region + emu)
              .setFooter(
                'Powered by www.speedrun.com',
                'https://i.imgur.com/PpxR9E1.png'
              )
          );
        }

        var embed = new Pagination.Embeds()
          .setArray(embedArray)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel);

        // More Info
        if (category.length > 1)
          embed.addField(
            `Category ${number + 1} of ${category.length}`,
            '🔼' + category[number + 1].category.data.name
          );
        // Next Category
        embed
          .addFunctionEmoji('🔼', () => {
            if (number + 1 < body.data.length) number = number + 1;
            try {
              const embedArray2 = [];
              for (let i = 1; i <= category[number].players.data.length; ++i) {
                let platform =
                  category[number].platforms.data.length > 0
                    ? category[number].platforms.data[0].name
                    : '';
                let region =
                  category[number].regions.data.length > 0
                    ? ' - ' + category[number].regions.data[0].name
                    : '';
                let emu = category[number].runs[i - 1].run.system.emulated
                  ? ' [EMU]'
                  : '';
                let runnerName =
                  category[number].players.data[i - 1].rel === 'user'
                    ? category[number].players.data[i - 1].names.international
                    : category[number].players.data[i - 1].name;

                var trophyIcon;
                if (i == 1) trophyIcon = '🏆 WR: ';
                if (i == 2) trophyIcon = '🥈 2nd: ';
                if (i == 3) trophyIcon = '🥉 3rd: ';
                if (i >= 4) trophyIcon = `${i}th: `;

                embedArray2.push(
                  new MessageEmbed()
                    .setColor('#3E8657')
                    .setTitle(
                      trophyIcon +
                        SpeedrunBasicCommand.convertTime(
                          category[number].runs[i - 1].run.times.primary_t
                        ) +
                        ' by ' +
                        runnerName
                    )
                    .setThumbnail(
                      category[number].game.data.assets['cover-medium'].uri
                    )
                    .setURL(category[number].runs[i - 1].run.weblink)
                    .setAuthor(
                      category[number].game.data.names.international +
                        ' - ' +
                        category[number].category.data.name,
                      '',
                      'http://speedrun.com/'
                    )
                    .addField(
                      ':calendar_spiral: Date Played:',
                      category[number].runs[i - 1].run.date
                    )
                    .addField(
                      ':video_game: Played On:',
                      platform + region + emu
                    )
                    .setFooter(
                      'Powered by www.speedrun.com',
                      'https://i.imgur.com/PpxR9E1.png'
                    )
                );
              }

              embed.setArray(embedArray2);
              if (number + 1 < category.length)
                embed.addField(
                  `Category ${number + 1} of ${category.length}`,
                  '🔼' +
                    category[number + 1].category.data.name +
                    '\n🔽' +
                    category[number - 1].category.data.name
                );
              else
                embed.addField(
                  `Category ${number + 1} of ${category.length}`,
                  '🔽' + category[number - 1].category.data.name
                );
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          })
          // Prev Category
          .addFunctionEmoji('🔽', () => {
            if (number > 0) number = number - 1;

            try {
              const embedArry2 = [];
              for (let i = 1; i <= category[number].players.data.length; ++i) {
                let platform =
                  category[number].platforms.data.length > 0
                    ? category[number].platforms.data[0].name
                    : '';
                let region =
                  category[number].regions.data.length > 0
                    ? ' - ' + category[number].regions.data[0].name
                    : '';
                let emu = category[number].runs[i - 1].run.system.emulated
                  ? ' [EMU]'
                  : '';
                let runnerName =
                  category[number].players.data[i - 1].rel === 'user'
                    ? category[number].players.data[i - 1].names.international
                    : category[number].players.data[i - 1].name;

                var trophyIcon;
                if (i == 1) trophyIcon = '🏆 WR: ';
                if (i == 2) trophyIcon = '🥈 2nd: ';
                if (i == 3) trophyIcon = '🥉 3rd: ';
                if (i >= 4) trophyIcon = `${i}th: `;

                embedArry2.push(
                  new MessageEmbed()
                    .setColor('#3E8657')
                    .setTitle(
                      trophyIcon +
                        SpeedrunBasicCommand.convertTime(
                          category[number].runs[i - 1].run.times.primary_t
                        ) +
                        ' by ' +
                        runnerName
                    )
                    .setThumbnail(
                      category[number].game.data.assets['cover-medium'].uri
                    )
                    .setURL(category[number].runs[i - 1].run.weblink)
                    .setAuthor(
                      category[number].game.data.names.international +
                        ' - ' +
                        category[number].category.data.name,
                      '',
                      'http://speedrun.com/'
                    )
                    .addField(
                      ':calendar_spiral: Date Played:',
                      category[number].runs[i - 1].run.date
                    )
                    .addField(
                      ':video_game: Played On:',
                      platform + region + emu
                    )
                    .setFooter(
                      'Powered by www.speedrun.com',
                      'https://i.imgur.com/PpxR9E1.png'
                    )
                );
              }
              embed.setArray(embedArry2);
              if (number > 0)
                embed.addField(
                  `Category ${number + 1} of ${category.length}`,
                  '🔼' +
                    category[number + 1].category.data.name +
                    '\n🔽' +
                    category[number - 1].category.data.name
                );
              else
                embed.addField(
                  `Category ${number + 1} of ${category.length}`,
                  '🔼' + category[number + 1].category.data.name
                );
            } catch (error) {
              message.say(':x: Something went wrong');
              console.log(error);
            }
          });

        embed.build();
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
