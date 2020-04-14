const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { yandexAPI } = require('../../config.json');
const ISO6391 = require('iso-639-1');
const fetch = require('node-fetch');

module.exports = class TranslateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'translate',
      memberName: 'translate',
      group: 'other',
      description:
        'Translate to any language using yandex translation service(only supported lanugages)',
      throttling: {
        usages: 2,
        duration: 12
      },
      args: [
        {
          key: 'targetLang',
          prompt:
            'What is the target language(language you want to translate to)',
          type: 'string',
          validate: function(text) {
            return text.length < 3000;
          }
        }
      ]
    });
  }

  async run(message, { targetLang }) {
    const langCode = ISO6391.getCode(targetLang);
    if (langCode === '')
      return message.channel.send('Please provide a valid language!');

    // text needs to be less than 3000 length

    await message.channel.send(
      `Please enter the text you want to translate to ${targetLang}`
    );

    try {
      const filter = msg => msg.content.length > 0 && msg.content.length < 3000;
      var response = await message.channel.awaitMessages(filter, {
        max: 1,
        maxProcessed: 1,
        time: 90000,
        errors: ['time']
      });
      var text = response.first().content;
    } catch (e) {
      return message.channel.send('You did not enter any text!');
    }

    try {
      var res = await fetch(
        // Powered by Yandex.Translate http://translate.yandex.com/
        `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexAPI}&text=${encodeURI(
          text
        )}&lang=${langCode}`
      );
      const json = await res.json();
      message.channel.send(embedTranslation(json.text[0]));
    } catch (e) {
      console.error(e);
      return message.say(
        'Something went wrong when trying to translate the text'
      );
    }

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
