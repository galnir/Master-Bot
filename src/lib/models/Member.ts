import mongoose, { Schema } from 'mongoose';

const MemberSchema: Schema = new Schema({
  memberId: {
    type: String,
    required: true
  },
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

export default mongoose.model('Member', MemberSchema);
