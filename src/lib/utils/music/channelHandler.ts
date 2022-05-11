import type { Queue } from './../queue/Queue';
import type { GuildMember, StageChannel } from 'discord.js';

export async function manageStageChannel(
  voiceChannel: StageChannel,
  botUser: GuildMember,
  instance: Queue
) {
  if (
    !botUser?.permissions.has(
      ('MODERATE_MEMBERS' && 'MANAGE_CHANNELS' && 'VIEW_CHANNEL') ||
        'ADMINISTRATOR'
    )
  )
    return await instance.channel?.send({
      content: `:interrobang: Please make promote me to a Speaker in ${voiceChannel.name}, Missing permissions "Administrator" ***OR*** "Manage Channels, Moderate Members, View Channels" for Full Stage Channel Features.`
    });
  if (!voiceChannel.stageInstance) {
    await voiceChannel
      .createStageInstance({
        topic: '🎶 ' + instance.player.queue.current?.title
      })
      .catch(error => {
        console.log('Failed to Create a Stage Instance.', error);
      });
  }

  if (botUser?.voice.suppress)
    await botUser?.voice.setSuppressed(false).catch((error: string) => {
      console.log('Failed to Set Suppressed to False.', error);
    });
  if (voiceChannel.stageInstance?.topic.startsWith('🎶')) {
    await voiceChannel.stageInstance
      ?.setTopic('🎶 ' + instance.player.queue.current?.title)
      .catch(error => {
        console.log('Failed to Set Topic.', error);
      });
  }
  return;
}
