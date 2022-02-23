import type { GuildMember } from 'discord.js';
import Member from '../../models/Member';

export default async function addMemberToDB(
  member: GuildMember,
  playlistName: String = ''
) {
  const memberObject = {
    memberId: member.id,
    username: member.user.username,
    joinedAt: member.joinedAt,
    savedPlaylists: playlistName ? [{ name: playlistName, urls: [] }] : []
  };

  const savedMember = new Member(memberObject);
  await savedMember.save();
}
