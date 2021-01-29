const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const ISO6391 = require('iso-639-1');
const translate = require('@vitalets/google-translate-api');

module.exports = class GoogleTranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'google-translate',
      memberName: 'google-translate',
      group: 'other',
      description: 'Translate to any language using Google translate.',
      throttling: {
        usages: 2,
        duration: 12
      },
      args: [
        {
          key: 'targetLang',
          prompt:
            'What is the target language?(language you want to translate to)',
          type: 'string',
          validate: function(text) {
            return text.length > 0;
          }
        },
        {
          key: 'queryText',
          prompt: 'What do you want to translate',
          type: 'string',
          validate: function(text) {
            return text.length < 3000;
          }
        }
      ]
    });
  }

  async run(message, { queryText, targetLang }) {
    const langCode = ISO6391.getCode(targetLang);
    if (langCode === '')
      return message.channel.send(':x: Please provide a valid language!');

    translate(queryText, { to: targetLang })
      .then(res => {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Google Translate: ')
          .setURL('https://translate.google.com/')
          .setDescription(res.text)
          .setFooter('Powered by Google Translate!');
        message.say(embed);
      })
      .catch(err => {
        message.say(
          ':x: Something went wrong when trying to translate the text'
        );
        console.error(err);
      });
  }
};
