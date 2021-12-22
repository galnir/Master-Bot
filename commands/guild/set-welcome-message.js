const { SlashCommandBuilder } = require('@discordjs/builders');
const Guild = require('../../utils/models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-welcome-message')
    .setDescription('Set the server welcome message')
    .addChannelOption(option =>
      option
        .setName('welcome-channel')
        .setDescription('Channel to display the message in')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('welcome-message')
        .setDescription('The welcome message')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply(
        'You must be the owner of this guild in order to use this command!'
      );
    }

    const channel = interaction.options.get('welcome-channel');

    const welcomeMessage = interaction.options.get('welcome-message').value;

    if (channel.channel.type !== 'GUILD_TEXT') {
      return interaction.reply('The channel has to be a text channel!');
    }

    const guildData = await Guild.findOne({
      guildId: interaction.guild.id
    }).exec();

    if (guildData) {
      guildData.welcomeMessage = welcomeMessage;
      guildData.welcomeMessage.channel = channel;
      guildData.welcomeMessageChannelId = channel.channel.id
      guildData.save();
    } else {
      const guildObject = {
        guildId: interaction.guild.id,
        ownerId: interaction.guild.ownerId,
        welcomeMessage: welcomeMessage,
        welcomeMessageChannelId: channel.channel.id
      };

      const guild = new Guild(guildObject);
      let didErr = false;

      guild.save(function onGuildSaveErr(err) {
        if (err) {
          console.error(err);
        }
      });

      if (didErr) {
        return interaction.reply(
          'Something went wrong when executing this command!'
        );
      }
    }
    return interaction.reply('Saved new welcome message!');
  }
};
