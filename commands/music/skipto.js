const { SlashCommandBuilder } = require('@discordjs/builders');
const { LoopType } = require('@lavaclient/queue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skip to a song in queue')
    .addIntegerOption(option => {
      return option
        .setName('position')
        .setDescription(
          'What is the position of the song you want to skip to in queue?'
        )
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

    if (player.queue.tracks.length < 1) {
      return interaction.reply('There are no songs in the queue!');
    }

    const position = interaction.options.get('position').value;

    if (player.queue.loop.type == LoopType.Queue) {
      const slicedBefore = player.queue.tracks.slice(0, position - 1);
      const slicedAfter = player.queue.tracks.slice(position - 1);
      player.queue.tracks = slicedAfter.concat(slicedBefore);
    } else {
      player.queue.tracks.splice(0, position - 1);
      player.queue.setLoop(LoopType.None);
    }

    player.queue.next();
    return interaction.reply(`Skipped to **${player.queue.current.title}**`);
  }
};
