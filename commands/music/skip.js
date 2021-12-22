const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song playng'),
  execute(interaction) {
    const client = interaction.client;
    const player = client.music.players.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is nothing playing right now!');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel || player.channelId !== voiceChannel.id) {
      return interaction.reply(
        'You need to be in the same channel as the bot in order to use that!'
      );
    }

    interaction.reply('Skipped song');
    player.queue.next();
  }
};
