const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume a paused song'),
  execute(interaction) {
    const client = interaction.client;
    const voiceChannel = interaction.member.voice.channel;

    const player = client.music.players.get(interaction.guild.id);
    if (!player) {
      return interaction.reply('There is nothing playing right now!');
    }

    if (!voiceChannel || voiceChannel.id !== player.channelId) {
      return interaction.reply('Join my voice channel and try again!');
    }

    if (!player.pause) {
      return interaction.reply('The song is not on pause!');
    }

    interaction.reply('Song resumed');
    player.resume();
  }
};
