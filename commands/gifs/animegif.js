const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');

if (!tenorAPI) return;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animegif')
    .setDescription('Suche nach einen Begriff, um ein Anime Gif dazu zu finden!'),
  execute(interaction) {
    fetch(`https://g.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=50`)
      .then(res => res.json())
      .then(json =>
        interaction.reply(json.results[Math.floor(Math.random() * 49)].url)
      )
      .catch(function onError() {
        interaction.reply(':x: Konnte dein Gif nicht laden.');
        return;
      });
  }
};
