import mongoose, { Schema } from 'mongoose';
import Member from './Member';

const GuildSchema = new Schema({
  guildId: String,
  ownerId: String,
  welcomeMessage: String,
  welcomeMessageChannelId: String,
  members: [Member]
});

export default mongoose.model('Guild', GuildSchema);
