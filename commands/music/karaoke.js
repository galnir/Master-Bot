const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('karaoke')
    .setDescription('Turn the playing track to karaoke!'),
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

    player.filters.karaoke = (player.karaoke = !player.karaoke)
      ? {
          level: 1,
          monoLevel: 1,
          filterBand: 220,
          filterWidth: 100
        }
      : undefined;

    await player.setFilters();
    return interaction.reply(
      `Karaoke ${player.bassboost ? 'enabled' : 'disabled'}`
    );
  }
};
