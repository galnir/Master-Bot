const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const api = require('novelcovid');

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
            prompt: 'What country do you like to search? Type `all` to display worldwide stats.',
            type: 'string',
            default: 'all',
          }
        ],
      });
    }
    async run(message, {country}) {
      if(country === "all" || country === "world" || country === "global") {
        await api.all().then((data) => {
          const covidall = new MessageEmbed()
            .setTitle('Worldwide Stats')
            .setColor('RANDOM')
            .addField('Total cases',`${data.cases.toLocaleString()}`)
            .addField('Total deaths',`${data.deaths.toLocaleString()}`)
            .addField('Total recovered',`${data.recovered.toLocaleString()}`)
            .addField('Cases today',`${data.todayCases.toLocaleString()}`)
            .addField('Deaths today',`${data.todayDeaths.toLocaleString()}`)
            .addField('Active cases',`${data.active.toLocaleString()}`)
            .addField('Public advice','[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)')
          message.channel.send(covidall)
        }).catch(err => console.error(err));
      } else {
        await api.countries({country: country}).then((data) => {
          if(data.country === undefined) {
            const covidundefined = new MessageEmbed()
              .setTitle('Error')
              .setColor('RED')
              .setDescription(':x: I couldn\'t find stats for this country!')
            message.channel.send(covidundefined)
          }
          const covidcountry = new MessageEmbed()
            .setTitle(`Country Stats for ${data.country}`)
            .setColor('RANDOM')
            .addField('Total cases',`${data.cases.toLocaleString()}`)
            .addField('Total deaths',`${data.deaths.toLocaleString()}`)
            .addField('Total recovered',`${data.recovered.toLocaleString()}`)
            .addField('Cases today',`${data.todayCases.toLocaleString()}`)
            .addField('Deaths today',`${data.todayDeaths.toLocaleString()}`)
            .addField('Active cases',`${data.active.toLocaleString()}`)
            .addField('Public advice','[Click here](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public)')
          message.channel.send(covidcountry)
        }).catch(err => console.error(err));
      }
    }
  };
