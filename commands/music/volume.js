const { SlashCommandBuilder } = require('@discordjs/builders');
const Guild = require('../../utils/models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set player volume!')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('🔊 Volume % (from 0 to 200)')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply(
        ':no_entry: Please join a voice channel and try again!'
      );
    }

    const player = interaction.client.playerManager.get(interaction.guildId);

    if (
      !player ||
      player.audioPlayer.state.status !== AudioPlayerStatus.Playing
    ) {
      return interaction.reply(
        ':no_entry: There is no song playing currently!'
      );
    } else if (
      interaction.member.voice.channel.id !==
      interaction.guild.me.voice.channel.id
    ) {
      return interaction.reply(
        ':no_entry: You must be in the same voice channel as the bot in order to change volume!'
      );
    }

    const value = interaction.options.get('query').value.replace(/\D/g, '');
    if (!value || value === '' || value > 200 || value < 0) {
      return interaction.reply(':x: Given volume value is not correct!');
    }

    const volume = Number(value) / 100;
    player.nowPlayingResource.volume.setVolume(volume);
    player.volume = volume;

    const guildData = await Guild.findOne({
      guildId: interaction.guild.id
    }).exec();

    if (guildData) {
      guildData.volume = volume;
      guildData.save();
    } else {
      new Guild({
        guildId: interaction.guild.id,
        ownerId: interaction.guild.ownerId,
        volume: volume
      }).save();
    }

    return interaction.reply('🔊 Volume set to ' + value + '%');
  }
};
