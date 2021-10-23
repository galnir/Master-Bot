const Guild = require('../utils/models/Guild');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildData = await Guild.findOne({ guildId: member.guild.id });

    if (!guildData) return;

    const channelId = guildData.welcomeMessageChannelId;

    const channel = await member.guild.channels.fetch(channelId);

    if (!channel) return;

    await channel.send({ content: guildData.welcomeMessage });
    return;
  }
};
