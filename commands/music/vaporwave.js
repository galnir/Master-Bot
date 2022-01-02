const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vaporwave')
    .setDescription('Apply vaporwave on the playing track!'),
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

    player.filters = (player.vaporwave = !player.vaporwave)
      ? {
          ...player.filters,
          equalizer: [
            { band: 1, gain: 0.7 },
            { band: 0, gain: 0.6 }
          ],
          timescale: { pitch: 0.7 },
          tremolo: { depth: 0.6, frequency: 14 }
        }
      : {
          ...player.filters,
          equalizer: undefined,
          timescale: undefined,
          tremolo: undefined
        };

    await player.setFilters();
    return interaction.reply(
      `Vaporwave ${player.vaporwave ? 'enabled' : 'disabled'}`
    );
  }
};
