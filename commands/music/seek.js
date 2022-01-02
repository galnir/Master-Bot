const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a desired point in a track')
    .addIntegerOption(option =>
      option
        .setName('seconds')
        .setDescription(
          'To what point in the track do you want to seek? (in seconds)'
        )
        .setRequired(true)
    ),
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

    if (!player.queue.current.isSeekable) {
      return interaction.reply('I cannot use seek on this track!');
    }

    const seconds = interaction.options.get('seconds').value;
    const milliseconds = seconds * 1000;
    if (milliseconds > player.queue.current.length || milliseconds < 0) {
      return interaction.reply('Please enter a valid number!');
    }
    await player.seek(milliseconds);
    interaction.reply(`Seeked to ${seconds} seconds`);
  }
};
