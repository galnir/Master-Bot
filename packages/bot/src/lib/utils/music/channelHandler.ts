import type { Queue } from '../queue/Queue';
import type { AnyChannel, GuildMember } from 'discord.js';
import Logger from '../logger';

export async function manageStageChannel(
  voiceChannel: AnyChannel,
  botUser: GuildMember,
  instance: Queue
) {
  if (voiceChannel.type !== 'GUILD_STAGE_VOICE') return;
  // Stage Channel Permissions From Discord.js Doc's
  if (
    !botUser?.permissions.has(
      ('MANAGE_CHANNELS' && 'MUTE_MEMBERS' && 'MOVE_MEMBERS') || 'ADMINISTRATOR'
    )
  )
    if (botUser.voice.suppress)
      return await instance.getTextChannel().then(
        async msg =>
          await msg?.send({
            content: `:interrobang: Please make promote me to a Speaker in ${voiceChannel.name}, Missing permissions "Administrator" ***OR*** "Manage Channels, Mute Members, and Move Members" for Full Stage Channel Features.`
          })
      );
  const tracks = await instance.tracks();
  const title =
    instance.player.trackData?.title.length! > 114
      ? `🎶 ${
          instance.player.trackData?.title.slice(0, 114) ??
          tracks.at(0)?.title.slice(0, 114)
        }...`
      : `🎶 ${instance.player.trackData?.title ?? tracks.at(0)?.title}`;

  if (!voiceChannel.stageInstance) {
    await voiceChannel
      .createStageInstance({
        topic: title,
        privacyLevel: 2 // Guild Only
      })
      .catch(error => {
        Logger.error('Failed to Create a Stage Instance. ' + error);
      });
  }

  if (botUser?.voice.suppress)
    await botUser?.voice.setSuppressed(false).catch((error: string) => {
      Logger.error('Failed to Set Suppressed to False. ' + error);
    });
  if (voiceChannel.stageInstance?.topic.startsWith('🎶')) {
    await voiceChannel.stageInstance?.setTopic(title).catch(error => {
      Logger.error('Failed to Set Topic. ' + error);
    });
  }
  return;
}
