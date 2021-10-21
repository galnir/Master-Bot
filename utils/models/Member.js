const mongoose = require('mongoose');

const Member = mongoose.model('Member', {
  memberId: {
    type: String,
    required: true
  },
  username: String,
  joinedAt: {
    type: Date,
    required: true
  },
  savedPlaylists: {
    type: Array,
    default: []
  },
  triviaAllTimeScore: {
    type: Number,
    default: 0
  }
});

module.exports = Member;
