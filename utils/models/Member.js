const mongoose = require('mongoose');

const Member = mongoose.model('Member', {
  memberId: String,
  username: String,
  joinedAt: Date,
  savedPlaylists: Array
});

module.exports = Member;
