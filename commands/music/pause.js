const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause a playing song'),
  execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const voiceChannel = interaction.member.voice.channel;

    const player = client.music.players.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is nothing playing right now!');
    }

    if (!voiceChannel || voiceChannel.id !== player.channelId) {
      return interaction.reply('Join my voice channel and try again!');
    }

    if (player.paused) {
      return interaction.reply('The song is already on pause!');
    }

    interaction.reply('Song paused');
    player.pause();
  }
};
