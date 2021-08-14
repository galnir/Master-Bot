const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Replies with a gif matching your query!')
    .addStringOption(option =>
      option
        .setName('gif')
        .setDescription('What gif would you like to search for?')
        .setRequired(true)
    ),
  execute(interaction) {
    const gif = interaction.options.get('gif').value;
    fetch(`https://g.tenor.com/v1/random?key=${tenorAPI}&q=${gif}&limit=1`)
      .then(res => res.json())
      .then(json => interaction.channel.send(json.results[0].url))
      .catch(function onError() {
        interaction.reply(':x: Failed to find a gif that matched your query!');
        // console.error(e); // if you uncomment this, add an 'e' parameter to onError
        return;
      });
  }
};
