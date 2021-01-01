const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class CovidCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'covid',
      group: 'other',
      aliases: ['covid19', 'coronavirus', 'corona'],
      memberName: 'covid',
      description: 'Displays COVID-19 stats.',
      args: [
        {
          key: 'country',
          prompt:
            'What country do you like to search? Type `all` to display worldwide stats.',
          type: 'string',
          default: 'all'
        }
      ]
    });
  }
  async run(message, { country }) {
    if (country === 'all' || country === 'world' || country === 'global') {
      await CovidCommand.getWorldStats()
        .then(data => {
          const covidall = new MessageEmbed()
            .setTitle('Worldwide Stats')
            .setColor('RANDOM')
            .addField('Total cases', `${data.cases.toLocaleString()}`)
            .addField('Total deaths', `${data.deaths.toLocaleString()}`)
            .addField('Total recovered', `${data.recovered.toLocaleString()}`)
            .addField('Cases today', `${data.todayCases.toLocaleString()}`)
            .addField('Deaths today', `${data.todayDeaths.toLocaleString()}`)
            .addField('Active cases', `${data.active.toLocaleString()}`)
            .addField(
              'Public advice',
              '[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            );
          message.channel.send(covidall);
        })
        .catch(function onError(err) {
          message.reply(err);
        });
    } else {
      await CovidCommand.getCountryStats(country)
        .then(data => {
          const covidcountry = new MessageEmbed()
            .setTitle(`Country Stats for ${data.country}`)
            .setColor('RANDOM')
            .addField('Total cases', `${data.cases.toLocaleString()}`)
            .addField('Total deaths', `${data.deaths.toLocaleString()}`)
            .addField('Total recovered', `${data.recovered.toLocaleString()}`)
            .addField('Cases today', `${data.todayCases.toLocaleString()}`)
            .addField('Deaths today', `${data.todayDeaths.toLocaleString()}`)
            .addField('Active cases', `${data.active.toLocaleString()}`)
            .addField(
              'Public advice',
              '[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            );
          message.channel.send(covidcountry);
        })
        .catch(function onError(err) {
          message.reply(err);
        });
    }
  }
  static getWorldStats() {
    return new Promise(async function(resolve, reject) {
      const url = 'https://disease.sh/v3/covid-19/all';
      try {
        const body = await fetch(url);
        if (body.status !== 200) {
          reject(
            `The covid API can't be accessed at the moment, please try later`
          );
        }
        const data = await body.json();
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          `The covid API can't be accessed at the moment, please try later`
        );
      }
    });
  }
  static getCountryStats(country) {
    return new Promise(async function(resolve, reject) {
      const url = `https://disease.sh/v3/covid-19/countries/${country}`;
      try {
        const body = await fetch(url);
        if (body.status !== 200) {
          reject(
            `There was a problem getting data from the API, make sure you entered a valid country name`
          );
        }
        const data = await body.json();
        resolve(data);
      } catch (e) {
        console.error(e);
        reject(
          `There was a problem getting data from the API, make sure you entered a valid country name`
        );
      }
    });
  }
};
