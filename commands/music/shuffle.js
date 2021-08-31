const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the music queue!'),

  execute(interaction) {
    interaction.deferReply();
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.followUp(
        `:no_entry: You must be in the same voice channel as the bot in order to use that!`
      );
    } else if (voiceChannel.id !== interaction.guild.me.voice.channel.id) {
      return interaction.followUp(
        `:no_entry: You must be in the same voice channel as the bot in order to use that!`
      );
    }
    const player = interaction.client.playerManager.get(interaction.guildId);
    if (!player) {
      return interaction.followUp(':x: There is nothing playing right now!');
    } else if (player.loopSong) {
      return interaction.followUp(
        ':x: Turn off the **loop** command before using the **shuffle** command!'
      );
    }

    if (player.queue.length < 1) {
      return interaction.reply('There are no songs in queue!');
    }

    shuffleQueue(player.queue);

    return interaction.followUp('The music queue has been shuffled!');
  }
};

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}
