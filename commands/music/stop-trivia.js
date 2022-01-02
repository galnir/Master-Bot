const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop-trivia')
    .setDescription('End a music trivia'),
  execute(interaction) {
    const client = interaction.client;

    if (!client.triviaMap.has(interaction.guildId)) {
      return interaction.reply(
        'There is no music trivia playing at the moment!'
      );
    }

    if (
      interaction.guild.me.voice.channel !== interaction.member.voice.channel
    ) {
      return interaction.reply('Please join my voice channel and try again!');
    }

    const player = client.music.players.get(interaction.guildId);

    const trivia = client.triviaMap.get(interaction.guildId);
    const collector = trivia.collector;
    trivia.wasTriviaEndCalled = true;
    collector.stop();

    player.queue.length = 0;
    player.disconnect();
    client.music.destroyPlayer(player.guildId);
    return interaction.reply('Ended the music trivia!');
  }
};
