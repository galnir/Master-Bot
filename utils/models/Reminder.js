const { Schema, model } = require('mongoose');

const ReminderSchema = Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  guildId: {
    type: Number,
    required: true
  },
  channelId: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now()
  }
});

module.exports = model('Reminder', ReminderSchema);
