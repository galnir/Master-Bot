const fetch = require('node-fetch');
const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class VinDecoderCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'vin-decoder',
      group: 'other',
      aliases: ['vin-decode', 'vd'],
      memberName: 'vin-decoder',
      description: 'Decodes VIN numbers of vehicles post 1980!',
      throttling: {
        usages: 1,
        duration: 4
      },
      args: [
        {
          key: 'yearQuery',
          prompt: 'Enter a year. (Example: 2011)',
          type: 'integer',
          error: ':x: Please enter a 4 digit number post 1980.',
          validate: function validatenumberLength(yearQuery) {
            return yearQuery.length == 4 && yearQuery > 1980;
          }
        },
        {
          key: 'vinQuery',
          prompt: 'Enter a VIN number.',
          type: 'string',
          error: `:x: Vin number is to long! 
         Please enter a VIN with no more than 17 digits.`,
          validate: function validateTextLength(vinQuery) {
            return vinQuery.length <= 17;
          }
        }
      ]
    });
  }

  async run(message, { vinQuery, yearQuery }) {
    // Uses https://vpic.nhtsa.dot.gov/api/

    const vinResponse = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vinQuery}?format=json&modelyear=${yearQuery}`
    )
      .then(vinResponse => vinResponse.json())
      .catch(function(error) {
        console.log(error);
        return message.say(':x: Something went wrong getting VIN data');
      });
    if (!vinResponse.Results || vinResponse.Results.length == 0)
      return message.say(':x: Could not find any results');
    const embedArray = [];

    for (let i = 0; i < vinResponse.Results.length; i++) {
      if (
        vinResponse.Results[i].Value &&
        vinResponse.Results[i].Variable != ('' || 'Error Code' || null)
      )
        if (vinResponse.Results[i].Variable != 'Manufacturer Id')
          if (
            vinResponse.Results[i].Value !=
            '0 - VIN decoded clean. Check Digit (9th position) is correct'
          )
            if (vinResponse.Results[i].Value != 'Not Applicable')
              embedArray.push({
                title: vinResponse.Results[i].Variable,
                field: vinResponse.Results[i].Value
              });
    }

    if (embedArray.length == 0) {
      return message.say(':x: Error no data after filtering');
    }
    let recallURL = '';
    if (vinQuery.length == 17)
      recallURL = `[Check For Recalls](https://www.nhtsa.gov/recalls?vin=${vinQuery}#vin)`;

    let embedURL = 'https://www.nhtsa.gov/';

    const vinEmbed = new Pagination.FieldsEmbed()
      .setArray(embedArray)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField(`Information`, function(e) {
        return `**${e.title}:**\n ${e.field}`;
      });

    vinEmbed.embed
      .setTitle(
        `Vin Decoder: ${vinResponse.SearchCriteria.replace(/VIN:/g, '')}`
      )
      .setURL(embedURL)
      .setDescription(
        `**Note:** ${vinResponse.Message.replace(
          /(Results returned successfully.)?(NOTE:)?/g,
          ''
        )}
       ${recallURL} `
      )
      .setColor('003e7e')
      .setFooter(
        'Powered by NHTSA.gov vPIC API',
        'https://www.nhtsa.gov/favicon-16x16.png'
      );
    vinEmbed.build();
  }
};
