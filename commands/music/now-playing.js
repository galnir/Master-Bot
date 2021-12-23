const { SlashCommandBuilder } = require('@discordjs/builders');
const NowPlayingEmbed = require('../../utils/music/NowPlayingEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('Display an embed detailing the song playing'),
  execute(interaction) {
    const client = interaction.client;
    const player = client.music.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply('There is nothing playing at the moment!');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (voiceChannel.id !== player.channelId) {
      return interaction.reply(
        'You must be in my channel in order to use that!'
      );
    }

    const embed = NowPlayingEmbed(
      player.queue.current,
      player.accuratePosition,
      player.queue.current.length
    );
    return interaction.reply({ embeds: [embed] });
  }
};
