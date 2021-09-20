const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leaves a voice channel if in one!'),
  execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('Please join a voice channel and try again!');
    }

    const player = interaction.client.playerManager.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is no song playing right now!');
    } else if (voiceChannel.id !== interaction.guild.me.voice.channel.id) {
      return interaction.reply(
        'You must be in the same voice channel as the bot in order for bot to leave!'
      );
    }

    player.connection.destroy();
    interaction.client.playerManager.delete(interaction.guildId);
    return interaction.reply('Left your voice channel!');
  }
};
