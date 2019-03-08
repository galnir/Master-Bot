const Discord = require('discord.js');
const fetch = require('node-fetch');
const { yandexAPI } = require('../config.json');

module.exports = {
  name: 'translate',
  cooldown: 5,
  description:
    'Translate to English(for now) from any supported language using yandex',
  execute(message, args) {
    if (!args)
      return message.reply(
        'Please provide something to translate and to what language'
      );
    const text = args.join(' ');
    // I'm using encodeURI() because of a TypeError that is happening with some languages
    fetch(
      // Powered by Yandex.Translate http://translate.yandex.com/
      `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexAPI}&text=${encodeURI(
        text
      )}&lang=${'en'}`
    )
      .then(res => res.json())
      .then(json => {
        return message.channel.send(embedTranslation(json.text[0]));
      })
      .catch(e => {
        console.error(e);
        return message.channel.send(
          'Something went wrong when trying to translate'
        );
      });

    function embedTranslation(text) {
      return new Discord.MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Yandex Translate')
        .setURL('http://translate.yandex.com/')
        .setDescription(text)
        .setFooter('Powered by Yandex.Translate');
    }
  }
};
