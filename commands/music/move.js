const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move a song to a different position in queue')
    .addIntegerOption(option => {
      return option
        .setName('current-position')
        .setDescription('What is the position of the song you want to move?')
        .setRequired(true);
    })
    .addIntegerOption(option => {
      return option
        .setName('new-position')
        .setDescription('What is the position you want to move the song to?')
        .setRequired(true);
    }),
  execute(interaction) {
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
      return interaction.reply('Join my voice channel and try again!');
    }

    const currentPosition = interaction.options.get('current-position').value;
    const newPosition = interaction.options.get('new-position').value;

    if (
      currentPosition < 1 ||
      currentPosition > player.queue.tracks.length ||
      newPosition < 1 ||
      newPosition > player.queue.tracks.length ||
      currentPosition == newPosition
    ) {
      return interaction.reply('Please enter valid position numbers!');
    }

    const title = player.queue.tracks[currentPosition - 1].title;
    array_move(player.queue.tracks, currentPosition - 1, newPosition - 1);

    interaction.reply(`**${title}** moved to position ${newPosition}`);
  }
};

// https://stackoverflow.com/a/5306832/9421002
function array_move(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}
