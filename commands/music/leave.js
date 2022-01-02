const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Make the bot leave its voice channel'),
  execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

    const player = client.music.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply(
        { content: 'There is no song playing right now!' },
        { ephemeral: true }
      );
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: 'Join the bots channel and try again!'
      });
    }
    interaction.reply('Leaving the voice channel!');
    player.disconnect();
    client.music.destroyPlayer(player.guildId);
  }
};
