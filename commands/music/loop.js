const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const createGuildData = require('../../utils/createGuildData');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set a song to play on loop'),

  execute(interaction) {
    if (!interaction.client.guildData.get(interaction.guildId)) {
      interaction.client.guildData.set(interaction.guildId, createGuildData());
    }
    const guildData = interaction.client.guildData.get(interaction.guildId);
    const player = interaction.client.playerManager.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is no song playing now!');
    } else if (player.audioPlayer.state.status !== AudioPlayerStatus.Playing) {
      return interaction.reply('There is no song playing now!');
    } else if (
      player.audioPlayer.state.status === AudioPlayerStatus.Playing &&
      guildData.triviaData.isTriviaRunning
    ) {
      return interaction.reply(
        `You can't use this command while a trivia is running!`
      );
    } else if (
      interaction.member.voice.channelId !==
      interaction.guild.me.voice.channelId
    ) {
      return interaction.reply(
        `You must be in the same voice channel as the bot in order to use that!`
      );
    }

    if (player.loopSong) {
      player.loopSong = false;
      return interaction.reply(
        `**${player.nowPlaying.title}** is no longer playing on repeat :repeat: `
      );
    }

    player.loopSong = true;
    interaction.reply(
      `**${player.nowPlaying.title}** is now playing on repeat :repeat: `
    );
  }
};
