const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');

if (!tenorAPI) return;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Replies with a cute cat picture!'),
  execute(interaction) {
    fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=cat&limit=1`)
      .then(res => res.json())
      .then(json => interaction.reply({ content: json.results[0].url }))
      .catch(err => {
        interaction.reply(':x: Request to find a kitty failed!');
        return console.error(err);
      });
  }
};
