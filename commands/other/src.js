const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class SpeedrunBasicCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'speedrun',
      group: 'other',
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
      message.reply('No game was found.');
    } else {
      let gameID = initial.data[0].id;

      const response = await fetch(
        `https://www.speedrun.com/api/v1/games/${gameID}/records?miscellaneous=no&scope=full-game&top=1&embed=game,category,players,platforms,regions`
      );
      const body = await response.json();

      if (body.data[0].runs.length === 0) {
        message.reply(
          body.data[0].game.data.names.international + ' has no runs.'
        );
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

        const time = require('resources/other/seconds.js');
        const embed = new MessageEmbed()
          .setColor('#800020')
          .setTitle(
            time.convert(body.data[0].runs[0].run.times.primary_t) +
              ' by ' +
              runnerName
          )
          .setThumbnail(body.data[0].game.data.assets['cover-medium'].uri)
          .setURL(body.data[0].runs[0].run.weblink)
          .setAuthor(
            body.data[0].game.data.names.international +
              ' - ' +
              body.data[0].category.data.name
          )
          .addField('Date Played:', body.data[0].runs[0].run.date)
          .addField('Played On:', platform + region + emu)
          .setTimestamp();

        message.channel.send(embed);
      }
    }
  }
};
