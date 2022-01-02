const { SlashCommandBuilder } = require('@discordjs/builders');
const { LoopType } = require('@lavaclient/queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song playng'),
  async execute(interaction) {
    const client = interaction.client;

    if (client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'You cannot use this command while a music trivia is playing!'
      );
    }

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

    if (player.queue.loop.type == LoopType.Song) {
      player.queue.tracks.unshift(player.queue.current);
    }
    await player.queue.next();
    interaction.reply('Skipped track');
  }
};
