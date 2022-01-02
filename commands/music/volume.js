const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change the volume of the music')
    .addIntegerOption(option => {
      return option
        .setName('volume')
        .setDescription('What volume would you like to set?')
        .setRequired(true);
    }),
  async execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const player = client.music.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply('There is nothing playing at the moment!');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (voiceChannel.id !== player.channelId) {
      return interaction.reply('Join my voice channel and try again!');
    }

    const volume = interaction.options.get('volume').value;
    if (volume > 200 || volume < 0) {
      return interaction.reply('Please enter a valid number between 0 and 200');
    }
    await player.setVolume(volume); // the lib handles the number
    return interaction.reply(`Set the volume to ${volume}`);
  }
};
