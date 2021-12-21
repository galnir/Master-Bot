const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Make the bot leave its voice channel'),
  execute(interaction) {
    const client = interaction.client;
    const player = client.music.players.get(interaction.guild.id);

    if (!player) {
      return interaction.reply(
        { content: 'There is no song playing right now!' },
        { ephemeral: true }
      );
    }

    const voiceState = interaction.guild.voiceStates.cache.get(
      interaction.user.id
    );
    if (!voiceState) {
      return interaction.reply({
        content: 'Join the bots channel and try again!'
      });
    }
    const voiceChannel = voiceState.channel;
    if (voiceChannel) {
      interaction.reply('Leaving the voice channel!');
      player.disconnect();
      client.music.destroyPlayer(player.guildId);
    }
  }
};
