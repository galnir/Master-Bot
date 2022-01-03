const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bassboost')
    .setDescription('Boost the bass of the playing track'),
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
      return interaction.reply('Please join my voice channel and try again!');
    }

    player.filters.equalizer = (player.bassboost = !player.bassboost)
      ? [
          { band: 0, gain: 0.55 },
          { band: 1, gain: 0.45 },
          { band: 2, gain: 0.4 },
          { band: 3, gain: 0.3 },
          { band: 4, gain: 0.15 },
          { band: 5, gain: 0 },
          { band: 6, gain: 0 }
        ]
      : undefined;

    await player.setFilters();
    return interaction.reply(
      `Bassboost ${player.bassboost ? 'enabled' : 'disabled'}`
    );
  }
};
