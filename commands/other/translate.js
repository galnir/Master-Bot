const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { yandexAPI } = require('../../config.json');
const fetch = require('node-fetch');

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      aliases: ['convert-to-english', 'translation'],
      memberName: 'translate',
      group: 'other',
      description:
        'Translate to English(for now) from any supported language using yandex translation service',
      throttling: {
        usages: 2,
        duration: 12
      },
      args: [
        {
          key: 'text',
          prompt: 'What text do you want to translate?',
          type: 'string',
          validate: text => text.length < 3000
        }
      ]
    });
  }

  run(message, { text }) {
    fetch(
      // Powered by Yandex.Translate http://translate.yandex.com/
      `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexAPI}&text=${encodeURI(
        text
      )}&lang=${'en'}`
    )
      .then(res => res.json())
      .then(json => {
        return message.say(embedTranslation(json.text[0]));
      })
      .catch(e => {
        console.error(e);
        return message.say(
          'Something went wrong when trying to translate the text'
        );
      });

    function embedTranslation(text) {
      return new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Yandex Translate')
        .setURL('http://translate.yandex.com/')
        .setDescription(text)
        .setFooter('Powered by Yandex.Translate');
    }
  }
};
