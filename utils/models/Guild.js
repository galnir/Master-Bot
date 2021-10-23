const mongoose = require('mongoose');

const Guild = mongoose.model('guild', {
  guildId: String,
  ownerId: String,
  welcomeMessage: String,
  welcomeMessageChannelId: String
});

module.exports = Guild;
