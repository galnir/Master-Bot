const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the queue')
    .addIntegerOption((option) => {
      return option
        .setName('position')
        .setDescription(
          'What is the position of the song you want to remove from the queue?'
        )
        .setRequired(true);
    }),
  execute(interaction) {
    const client = interaction.client;
    const player = client.music.players.get(interaction.guildId);

    if (!player) {
      return interaction.reply('There is nothing playing at the moment!');
    }

    const voiceChannel = interaction.member.voice.channel;
    if (voiceChannel.id !== player.channelId) {
      return interaction.reply('Join my voice channel and try again!');
    }

    const position = interaction.options.get('position').value;
    if (position < 1 || position > player.queue.tracks.length) {
      return interaction.reply('Please enter a valid position number!');
    }

    player.queue.tracks.splice(position - 1, 1);
    return interaction.reply(
      `:wastebasket: Removed song number ${position} from queue!`
    );
  }
};
