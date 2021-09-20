const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Display the current playing song'),
  async execute(interaction) {
    const player = await interaction.client.playerManager.get(
      interaction.guildId
    );

    if (!player) {
      return interaction.reply('There is nothing playing now!');
    } else if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
      return interaction.reply('There is no song playing right now!');
    }

    const nowPlayingEmbed = new MessageEmbed()
      .setTitle('Now playing')
      .setColor('#ff0000')
      .setDescription(
        `[${player.nowPlaying.title}](${player.nowPlaying.url}) - **[${player.nowPlaying.memberDisplayName}]**`
      );

    interaction.reply({ embeds: [nowPlayingEmbed] });
  }
};
