const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a specific song from queue')
    .addIntegerOption(option =>
      option
        .setName('position')
        .setDescription('What song number do you want to remove from queue?')
        .setRequired(true)
    ),
  execute(interaction) {
    const position = interaction.options.get('position').value;
    const player = interaction.client.playerManager.get(interaction.guildId);

    if (!player) {
      return interaction.reply('There is nothing playing now!');
    }

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply(
        ':no_entry: Please join a voice channel and try again!'
      );
    } else if (voiceChannel.id !== interaction.guild.me.voice.channel.id) {
      interaction.reply(
        `:no_entry: You must be in the same voice channel as the bot in order to use that!`
      );
      return;
    }

    if (position < 1 || position > player.queue.length) {
      return interaction.reply('Please enter a valid position!');
    }

    player.queue.splice(position - 1, 1);
    return interaction.reply(
      `:wastebasket: Removed song number ${position} from queue!`
    );
  }
};
