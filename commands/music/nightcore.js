const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nightcore')
    .setDescription('Enable/Disable Nightcore filter'),
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
      return interaction.reply(
        'You must be in my channel in order to use that!'
      );
    }

    player.filters.timescale = (player.nightcore = !player.nightcore)
      ? { speed: 1.125, pitch: 1.125, rate: 1 }
      : undefined;

    await player.setFilters();
    return interaction.reply(
      `Nightcore ${player.nightcore ? 'enabled' : 'disabled'}`
    );
  }
};
