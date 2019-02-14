const fetch = require("node-fetch");
const { yandexAPI } = require("../config.json");

module.exports = {
  name: "translate",
  cooldown: 5,
  description:
    "Translate to English(for now) from any supported language using yandex",
  async execute(message, args) {
    if (!args)
      return message.reply(
        "Please provide something to translate and to what language"
      );
    const text = args.join(" ");
    let lang;
    // I'm using encodeURI() because of a TypeError that is happening with some languages
    try {
      await fetch(
        `https://translate.yandex.net/api/v1.5/tr.json/detect?key=${yandexAPI}&text=${encodeURI(
          text
        )}`
      )
        .then(res => res.json())
        .then(json => {
          lang = json.lang;
        });
    } catch (e) {
      console.error(e);
      message.channel.send(
        "Something went wrong when trying to detect language"
      );
    }
    if (!lang) return message.reply("Provide characters only!");

    let translatedText;

    try {
      await fetch(
        `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexAPI}&text=${encodeURI(
          text
        )}&lang=${lang + "-" + "en"}`
      )
        .then(res => res.json())
        .then(json => {
          translatedText = json.text[0];
        });
    } catch (e) {
      console.error(e);
      message.channel.send("Something went wrong when trying to translate");
    }
  }
};
