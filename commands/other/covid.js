const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('covid')
    .setDescription('Displays COVID-19 stats.')
    .addStringOption(option =>
      option
        .setName('country')
        .setDescription(
          'What country do you like to search? Type `all` to display worldwide stats.'
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const country = interaction.options.get('country').value;
    if (country === 'all' || country === 'world' || country === 'global') {
      await getWorldStats()
        .then(data => {
          const covidall = new MessageEmbed()
            .setTitle('Worldwide Stats')
            .setColor('RANDOM')
            .setThumbnail('https://i.imgur.com/a4014ev.png') // World Globe image
            .addField('Total cases', data.cases.toLocaleString(), true)
            .addField('Cases today', data.todayCases.toLocaleString(), true)
            .addField('Deaths today', data.todayDeaths.toLocaleString(), true)
            .addField(
              'Active cases',
              `${data.active.toLocaleString()} (${(
                (data.active / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total recovered',
              `${data.recovered.toLocaleString()} (${(
                (data.recovered / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total deaths',
              `${data.deaths.toLocaleString()} (${(
                (data.deaths / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField('Tests', `${data.tests.toLocaleString()}`, true)
            .addField(
              'Cases Per Mil',
              `${data.casesPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Deaths Per Mil',
              `${data.deathsPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Public advice',
              '[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            )
            .setFooter('Last updated')
            .setTimestamp(data.updated);

          interaction.reply({ embeds: [covidall] });
        })
        .catch(function onError(err) {
          console.error(err);
          interaction.reply('Something went wrong!');
        });
    } else {
      await getCountryStats(country)
        .then(data => {
          const covidcountry = new MessageEmbed()
            .setTitle(`Country Stats for ${data.country}`)
            .setColor('RANDOM')
            .setThumbnail(data.countryInfo.flag)
            .addField('Total cases', data.cases.toLocaleString(), true)
            .addField('Cases today', data.todayCases.toLocaleString(), true)
            .addField('Deaths today', data.todayDeaths.toLocaleString(), true)
            .addField(
              'Active cases',
              `${data.active.toLocaleString()} (${(
                (data.active / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total recovered',
              `${data.recovered.toLocaleString()} (${(
                (data.recovered / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField(
              'Total deaths',
              `${data.deaths.toLocaleString()} (${(
                (data.deaths / data.cases) *
                100
              ).toFixed(2)}%)`,
              true
            )
            .addField('Tests', `${data.tests.toLocaleString()}`, true)
            .addField(
              'Cases Per Mil',
              `${data.casesPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Deaths Per Mil',
              `${data.deathsPerOneMillion.toLocaleString()}`,
              true
            )
            .addField(
              'Public advice',
              '[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)'
            )
            .setFooter('Last updated')
            .setTimestamp(data.updated);

          interaction.reply({ embeds: [covidcountry] });
        })
        .catch(function onError(err) {
          console.error(err);
          interaction.reply('Something went wrong!');
        });
    }
    function getWorldStats() {
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
    function getCountryStats(country) {
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
  }
};
