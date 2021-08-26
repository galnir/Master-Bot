const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const createGuildData = require('../../utils/createGuildData');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('loopqueue')
    .setDescription('Loop the queue x times! - (the default is 1 time)')
    .addIntegerOption(option =>
      option
        .setName('looptimes')
        .setDescription('How many times do you want to loop the queue?')
    ),

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
    } else if (player.loopSong) {
      return interaction.reply(
        ':x: Turn off the **loop** command before using the **loopqueue** command'
      );
    }

    let looptimes = interaction.options.get('looptimes');
    if (!looptimes) {
      looptimes = 1;
    } else {
      looptimes = looptimes.value;
    }

    if (player.loopQueue) {
      player.loopQueue = false;
      return interaction.reply(
        ':repeat: The queue is no longer playing on **loop**'
      );
    }
    player.loopQueue = true;
    return interaction.reply(':repeat: The queue is now playing on **loop**');
  }
};
